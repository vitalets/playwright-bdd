/**
 * Generate Playwright test file for feature.
 */

/* eslint-disable max-lines, max-params */

import {
  FeatureChild,
  RuleChild,
  Scenario,
  Background,
  Step,
  Feature,
  Rule,
} from '@cucumber/messages';
import path from 'node:path';
import { Formatter } from './formatter';
import { KeywordsMap, getKeywordsMap } from './i18n';
import parseTagsExpression from '@cucumber/tag-expressions';
import { LANG_EN, isEnglish } from '../config/lang';
import { GherkinDocumentWithPickles, PickleWithLocation } from '../gherkin/types';
import { BDDConfig } from '../config/types';
import { ImportTestGuesser } from './importTest';
import { GherkinDocumentQuery } from '../gherkin/documentQuery';
import { ExamplesTitleBuilder } from './examplesTitleBuilder';
import { getTagNames, isScenarioOutline } from '../gherkin/helpers';
import { StepFinder } from '../steps/finder';
import { exit } from '../utils/exit';
import { StepDefinition } from '../steps/stepDefinition';
import { TestFileHooks } from './hooks';
import { getSpecFileByFeatureFile } from './paths';
import { SpecialTags } from './specialTags';
import { BackgroundGen } from './background';
import { StepData, TestGen } from './test';
import { SourceMapper } from './sourceMapper';
import { BddDataRenderer } from '../bddData/renderer';
import { extractTagsFromPath } from '../steps/tags';
import { removeDuplicates } from '../utils';
import { supportedFeatures } from '../playwright/supportedFeatures';

type TestFileOptions = {
  config: BDDConfig;
  gherkinDocument: GherkinDocumentWithPickles;
  tagsExpression?: ReturnType<typeof parseTagsExpression>;
};

export class TestFile {
  private lines: string[] = [];
  private i18nKeywordsMap?: KeywordsMap;
  private formatter: Formatter;
  private gherkinDocumentQuery: GherkinDocumentQuery;
  private stepFinder: StepFinder;
  private hooks: TestFileHooks;
  private backgrounds: BackgroundGen[] = [];
  private tests: TestGen[] = [];
  private tagsFromPath: string[];

  public outputPath: string;

  constructor(private options: TestFileOptions) {
    this.outputPath = getSpecFileByFeatureFile(this.config, this.featureUri);
    this.formatter = new Formatter(options.config);
    this.gherkinDocumentQuery = new GherkinDocumentQuery(this.gherkinDocument);
    this.stepFinder = new StepFinder(options.config);
    this.hooks = new TestFileHooks(this.formatter);
    this.tagsFromPath = extractTagsFromPath(this.featureUri);
  }

  get gherkinDocument() {
    return this.options.gherkinDocument;
  }

  /**
   * Returns to feature file, relative to configDir.
   * Separator is OS-specific (/ on Unix, \ on Windows).
   */
  get featureUri() {
    return this.gherkinDocument.uri!;
  }

  get pickles() {
    return this.gherkinDocument.pickles;
  }

  get content() {
    return this.lines.join('\n');
  }

  get language() {
    return this.gherkinDocument.feature?.language || LANG_EN;
  }

  get isEnglish() {
    return isEnglish(this.language);
  }

  get config() {
    return this.options.config;
  }

  hasExecutableTests() {
    return this.tests.some((test) => !test.skippedByTag);
  }

  build(): this {
    if (!this.gherkinDocumentQuery.hasPickles()) return this;
    this.loadI18nKeywords();
    // important to calc suites first, b/c file header depends on used steps and used tags
    const suites = this.renderRootSuite();

    this.hooks.fillFromTests(this.tests);

    // todo: use lines instead of this.lines,
    // and pass them to updateTestLocations() explicitly
    this.lines = [
      ...this.renderFileHeader(), // prettier-ignore
      ...suites,
    ];

    this.renderInplaceBackgrounds();

    this.lines.push(...this.renderTechnicalSection());

    return this;
  }

  /**
   * Collect missing steps for all tests in the feature file.
   */
  getMissingSteps() {
    return (
      this.tests
        // if user skipped scenario manually, don't report missing steps
        .filter((test) => !test.skippedByTag)
        .reduce<StepData[]>((acc, test) => {
          test.stepsData.forEach((stepData) => {
            if (!stepData.matchedDefinition) acc.push(stepData);
          });
          return acc;
        }, [])
    );
  }

  getUsedDefinitions() {
    const usedDefinitions = new Set<StepDefinition>();
    this.tests.forEach((test) => {
      test.stepsData.forEach(({ matchedDefinition }) => {
        if (matchedDefinition) usedDefinitions.add(matchedDefinition.definition);
      });
    });
    return usedDefinitions;
  }

  private renderFileHeader() {
    const importTestFrom = this.resolveImportTestFrom();
    return this.formatter.fileHeader(this.featureUri, importTestFrom);
  }

  private loadI18nKeywords() {
    if (!this.isEnglish) {
      this.i18nKeywordsMap = getKeywordsMap(this.language);
    }
  }

  private renderTechnicalSection() {
    const worldFixtureName = this.getWorldFixtureName();
    const sourceMapper = new SourceMapper(this.lines);
    const bddDataRenderer = new BddDataRenderer(this.tests, sourceMapper);

    const testUse = this.formatter.testUse([
      ...this.formatter.testFixture(),
      ...this.formatter.uriFixture(this.featureUri),
      ...bddDataRenderer.renderFixture(),
      ...(worldFixtureName ? this.formatter.worldFixture(worldFixtureName) : []),
      ...(supportedFeatures.ariaSnapshots && this.config.aiFix?.promptAttachment
        ? this.formatter.pageFixtureWithPromptAttachment()
        : []),
    ]);

    return [
      '// == technical section ==', // prettier-ignore
      '',
      ...this.hooks.render(),
      ...testUse,
      '',
      ...bddDataRenderer.renderVariable(),
    ];
  }

  private renderRootSuite() {
    const { feature } = this.gherkinDocument;
    if (!feature) throw new Error(`Document without feature.`);
    return this.renderDescribe(feature);
  }

  /**
   * Generate test.describe suite for Feature or Rule
   */
  private renderDescribe(feature: Feature | Rule) {
    const specialTags = new SpecialTags(getTagNames(feature.tags));
    const lines: string[] = [];
    feature.children.forEach((child) => {
      lines.push(...this.renderChild(child));
    });
    return this.formatter.describe(feature.name, specialTags, lines);
  }

  // eslint-disable-next-line visual/complexity
  private renderChild(child: FeatureChild | RuleChild) {
    if ('rule' in child && child.rule) return this.renderDescribe(child.rule);
    if (child.background) return this.renderBackgroundPlaceholder(child.background);
    if (child.scenario)
      return isScenarioOutline(child.scenario) // prettier-ignore
        ? this.renderScenarioOutline(child.scenario)
        : this.renderScenario(child.scenario);

    throw new Error(`Empty child: ${JSON.stringify(child)}`);
  }

  private renderBackgroundPlaceholder(bg: Background) {
    const bgGen = new BackgroundGen(this.formatter, this.i18nKeywordsMap, bg);
    this.backgrounds.push(bgGen);
    return [bgGen.placeholder];
  }

  /**
   * Insert test.beforeEach for Backgrounds
   */
  private renderInplaceBackgrounds() {
    this.backgrounds.forEach((bg) => bg.renderInplace(this.lines));
  }

  private renderScenario(scenario: Scenario) {
    const testTitle = scenario.name;
    const pickle = this.findPickle(scenario.id, testTitle);
    const ownTestTags = getTagNames(scenario.tags);
    return this.renderTest(pickle, testTitle, ownTestTags, scenario.steps);
  }

  /**
   * Generate test.describe suite for Scenario Outline
   */
  private renderScenarioOutline(scenario: Scenario) {
    const specialTags = new SpecialTags(getTagNames(scenario.tags));
    const examplesTitleBuilder = this.createExamplesTitleBuilder(scenario);
    const lines: string[] = [];

    scenario.examples.forEach((examples) => {
      examples.tableBody.forEach((exampleRow) => {
        const testTitle = examplesTitleBuilder.buildTitle(examples, exampleRow);
        const pickle = this.findPickle(exampleRow.id, testTitle);
        const ownTestTags = getTagNames(examples.tags);
        const testLines = this.renderTest(pickle, testTitle, ownTestTags, scenario.steps);
        lines.push(...testLines);
      });
    });

    // don't render describe without tests
    if (!lines.length) return [];

    return this.formatter.describe(scenario.name, specialTags, lines);
  }

  /**
   * Render test for Scenario or Scenario Outline.
   */
  private renderTest(
    pickle: PickleWithLocation,
    testTitle: string,
    ownTestTags: string[],
    gherkinSteps: readonly Step[],
  ) {
    const testTags = removeDuplicates([...this.tagsFromPath, ...getTagNames(pickle.tags)]);
    if (this.isSkippedByTagsExpression(testTags)) return [];

    const test = new TestGen(
      this.config,
      this.featureUri,
      this.i18nKeywordsMap,
      this.stepFinder,
      this.formatter,
      this.backgrounds,
      pickle,
      testTitle,
      gherkinSteps,
      testTags,
      ownTestTags,
    );
    this.tests.push(test);

    return test.render();
  }

  private findPickle(astNodeId: string, testTitle: string) {
    const pickles = this.gherkinDocumentQuery.getPickles(astNodeId);
    const pickle = pickles[0];

    if (!pickle) {
      exit(`Pickle not found for scenario: ${testTitle}`);
    } else if (pickles.length > 1) {
      exit(`Found ${pickles.length} pickles for scenario: ${testTitle}`);
    }

    return pickle;
  }

  private isSkippedByTagsExpression(tags: string[]) {
    // see: https://github.com/cucumber/tag-expressions/tree/main/javascript
    const { tagsExpression } = this.options;
    return tagsExpression && !tagsExpression.evaluate(tags);
  }

  private getWorldFixtureName() {
    const worldFixtureNames = new Set<string>();

    this.tests.forEach((test) => {
      test.stepsData.forEach(({ matchedDefinition }) => {
        if (matchedDefinition) {
          const { worldFixture } = matchedDefinition.definition;
          if (worldFixture) worldFixtureNames.add(worldFixture);
        }
      });
    });

    this.hooks.getWorldFixtureNames().forEach((name) => worldFixtureNames.add(name));

    if (worldFixtureNames.size > 1) {
      throw new Error(
        [
          `All steps and hooks in a feature file should have the same worldFixture.`,
          `Found fixtures: ${[...worldFixtureNames].join(', ')}`,
          `File: ${this.featureUri}`,
        ].join('\n'),
      );
    }

    return [...worldFixtureNames][0];
  }

  private createExamplesTitleBuilder(scenario: Scenario) {
    return new ExamplesTitleBuilder({
      config: this.config,
      gherkinDocument: this.gherkinDocument,
      isEnglish: this.isEnglish,
      scenario,
    });
  }

  private resolveImportTestFrom() {
    let { importTestFrom } = this.config;
    if (!importTestFrom) {
      importTestFrom = new ImportTestGuesser(
        this.featureUri,
        this.getUsedDefinitions(),
        this.getUsedPomFixtures(),
        this.hooks.getCustomTestInstances(),
      ).guess();
    }
    if (!importTestFrom) return;

    const { file, varName } = importTestFrom;
    const dir = path.dirname(this.outputPath);
    return {
      file: path.relative(dir, file),
      varName,
    };
  }

  private getUsedPomFixtures() {
    const usedPomFixtures = new Set<string>();
    this.tests.forEach((test) => {
      test.stepsData.forEach(({ pomFixtureName }) => {
        if (pomFixtureName) usedPomFixtures.add(pomFixtureName);
      });
    });
    return usedPomFixtures;
  }
}
