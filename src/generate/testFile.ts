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
import { GherkinDocumentWithPickles, PickleWithLocation } from '../features/types';
import { BDDConfig } from '../config/types';
import { ImportTestFromGuesser } from './importTestFrom';
import { GherkinDocumentQuery } from '../features/documentQuery';
import { ExamplesTitleBuilder } from './examplesTitleBuilder';
import { MissingStep } from '../snippets/types';
import { getStepTextWithKeyword, getTagNames, isScenarioOutline } from '../features/helpers';
import { StepFinder } from '../steps/finder';
import { exit } from '../utils/exit';
import { StepDefinition } from '../steps/stepDefinition';
import { TestFileHooks } from './testFileHooks';
import { getSpecFileByFeatureFile } from './paths';
import { SpecialTags } from '../specialTags';
import { BackgroundGen } from './background';
import { TestGen } from './test/test';
import { SourceMapper } from './sourceMapper';
import { BddDataRenderer } from '../bddData/renderer';

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

  public outputPath: string;

  constructor(private options: TestFileOptions) {
    this.outputPath = getSpecFileByFeatureFile(this.config, this.featureUri);
    this.formatter = new Formatter(options.config);
    this.gherkinDocumentQuery = new GherkinDocumentQuery(this.gherkinDocument);
    this.stepFinder = new StepFinder(options.config);
    this.hooks = new TestFileHooks(this.formatter);
  }

  get gherkinDocument() {
    return this.options.gherkinDocument;
  }

  // doc.uri always exists and is relative to configDir
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

  // todo: move to test.ts or to separate class
  getMissingSteps() {
    const missingSteps: MissingStep[] = [];
    this.tests.forEach((test) => {
      if (test.skippedByTag) return;
      test.stepsData.forEach(({ matchedDefinition, pickleStep, gherkinStep }) => {
        if (!matchedDefinition) {
          const { line, column } = gherkinStep.location;
          missingSteps.push({
            location: { uri: this.featureUri, line, column },
            textWithKeyword: getStepTextWithKeyword(gherkinStep.keyword, pickleStep.text),
            pickleStep,
          });
        }
      });
    });
    return missingSteps;
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
      ...this.formatter.scenarioHooksFixtures('before', this.hooks.before.getFixtureNames()),
      ...this.formatter.scenarioHooksFixtures('after', this.hooks.after.getFixtureNames()),
      ...(worldFixtureName ? this.formatter.worldFixture(worldFixtureName) : []),
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
   * Generate test from Examples row of Scenario Outline
   */
  // private getOutlineTest(
  //   scenario: Scenario,
  //   examples: Examples,
  //   exampleRow: TableRow,
  //   title: string,
  //   parent: TestNode,
  // ) {
  //   const node = new TestNode({ name: title, tags: examples.tags }, parent);
  //   if (this.isSkippedByTagsExpression(node)) return [];
  //   const pickle = this.bddMetaBuilder.registerTest(node, exampleRow.id);
  //   if (this.isSkippedBySpecialTag(node)) {
  //     return this.formatter.test(node, new Set(), pickle.location.line, []);
  //   }
  //   const { fixtures, lines, hasMissingSteps } = this.getSteps(scenario, node.tags, exampleRow.id);
  //   this.handleMissingStepsInScenario(hasMissingSteps, node);
  //   this.hooks.registerHooksForTest(node);
  //   return this.formatter.test(node, fixtures, pickle.location.line, lines);
  // }

  /**
   * Generate test from Scenario
   */
  // private getTestOld(scenario: Scenario, parent: TestNode) {
  //   const node = new TestNode(scenario, parent);
  //   if (this.isSkippedByTagsExpression(node)) return [];
  //   const pickle = this.bddMetaBuilder.registerTest(node, scenario.id);
  //   if (this.isSkippedBySpecialTag(node)) {
  //     return this.formatter.test(node, new Set(), pickle.location.line, []);
  //   }
  //   const { fixtures, lines, hasMissingSteps } = this.getSteps(scenario, node.tags);
  //   this.handleMissingStepsInScenario(hasMissingSteps, node);
  //   this.hooks.registerHooksForTest(node);
  //   return this.formatter.test(node, fixtures, pickle.location.line, lines);
  // }

  /**
   * NEW way of getting test - by pickle
   * Universal for Scenario and Scenario Outline
   */
  private renderTest(
    pickle: PickleWithLocation,
    testTitle: string,
    ownTestTags: string[],
    gherkinSteps: readonly Step[],
  ) {
    const testTags = getTagNames(pickle.tags);
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
      ownTestTags,
    );
    this.tests.push(test);

    return test.render();
  }

  private findPickle(astNodeId: string, testTitle: string) {
    const pickles = this.gherkinDocumentQuery.getPickles(astNodeId);
    if (pickles.length !== 1) {
      exit(`Found ${pickles.length} pickle(s) for scenario: ${testTitle}`);
    }
    return pickles[0];
  }

  /**
   * Generate test steps
   */
  // private getSteps(scenario: Scenario | Background, tags?: string[], outlineExampleRowId?: string) {
  //   const testFixtureNames = new Set<string>();
  //   const decoratorSteps = new DecoratorSteps({
  //     statefulPoms: this.config.statefulPoms,
  //     featureUri: this.featureUri,
  //     testTitle: scenario.name || 'Background',
  //     testFixtureNames,
  //     testTags: tags,
  //   });

  //   const stepToKeywordType = mapStepsToKeywordTypes(scenario.steps, this.language);
  //   let hasMissingSteps = false;

  //   // todo: refactor internal fn, move to a separate class.
  //   // The problem - it is highly coupled with the testFile class,
  //   // need to pass many params: config, language, featureUri, i18nKeywordsMap, gherkinDocument, etc...
  //   // eslint-disable-next-line max-statements
  //   const lines = scenario.steps.map((step, index) => {
  //     const keywordType = stepToKeywordType.get(step)!;
  //     const keywordEng = this.getStepEnglishKeyword(step);
  //     testFixtureNames.add(keywordEng);
  //     this.bddMetaBuilder.registerStep(step, keywordType);
  //     // pickleStep contains step text with inserted example values and argument
  //     const pickleStep = this.findPickleStep(step, outlineExampleRowId);
  //     const matchedDefinition = this.findMatchedDefinition(keywordType, step, pickleStep, tags);
  //     if (!matchedDefinition) {
  //       hasMissingSteps = true;
  //       return this.handleMissingStep(keywordEng, keywordType, pickleStep, step);
  //     }

  //     this.usedStepDefinitions.add(matchedDefinition.definition);

  //     if (matchedDefinition.definition.isDecorator()) {
  //       decoratorSteps.push({
  //         index,
  //         keywordEng,
  //         pickleStep,
  //         pomNode: matchedDefinition.definition.pomNode,
  //       });

  //       // for decorator steps, line and fixtureNames are filled later in second pass
  //       return '';
  //     }

  //     const stepFixtureNames = this.getStepFixtureNames(matchedDefinition);
  //     stepFixtureNames.forEach((fixtureName) => testFixtureNames.add(fixtureName));

  //     return this.formatter.step(
  //       keywordEng,
  //       pickleStep.text,
  //       pickleStep.argument,
  //       stepFixtureNames,
  //     );
  //   });

  //   // fill decorator step slots in second pass (to guess fixtures)
  //   // TODO: for background steps we can delay resolving fixtures
  //   // until all scenarios steps are processed. After that we know all used fixtures,
  //   // and can guess background fixtures more precisely.
  //   // But for statefulPoms=false (that is default) it is not very important.
  //   decoratorSteps.resolveFixtureNames();
  //   decoratorSteps.forEach(({ index, keywordEng, pickleStep, fixtureName }) => {
  //     testFixtureNames.add(fixtureName);
  //     this.usedDecoratorFixtures.add(fixtureName);
  //     const stepFixtureNames = [fixtureName];
  //     lines[index] = this.formatter.step(
  //       keywordEng,
  //       pickleStep.text,
  //       pickleStep.argument,
  //       stepFixtureNames,
  //     );
  //   });

  //   return { fixtures: testFixtureNames, lines, hasMissingSteps };
  // }

  // private findMatchedDefinition(
  //   keywordType: KeywordType,
  //   scenarioStep: Step,
  //   pickleStep: PickleStep,
  //   tags?: string[],
  // ) {
  //   const matchedDefinitions = this.stepFinder.findDefinitions(keywordType, pickleStep.text, tags);

  //   if (matchedDefinitions.length > 1) {
  //     const stepTextWithKeyword = getStepTextWithKeyword(scenarioStep.keyword, pickleStep.text);
  //     const stepLocation = `${this.featureUri}:${stringifyLocation(scenarioStep.location)}`;
  //     // todo: maybe not exit and collect all duplicates?
  //     exit(formatDuplicateStepsMessage(matchedDefinitions, stepTextWithKeyword, stepLocation));
  //   }

  //   return matchedDefinitions[0];
  // }

  // private handleMissingStep(
  //   keywordEng: StepFixtureName,
  //   keywordType: KeywordType,
  //   pickleStep: PickleStep,
  //   step: Step,
  // ) {
  //   const { line, column } = step.location;
  //   this.missingSteps.push({
  //     location: { uri: this.featureUri, line, column },
  //     textWithKeyword: getStepTextWithKeyword(step.keyword, pickleStep.text),
  //     keywordType,
  //     pickleStep,
  //   });
  //   return this.formatter.missingStep(keywordEng, pickleStep.text);
  // }

  // private findPickleStep(step: Step, exampleRowId?: string) {
  //   let pickleSteps = this.gherkinDocumentQuery.getPickleSteps(step.id);
  //   if (exampleRowId) {
  //     pickleSteps = pickleSteps.filter((pickleStep) =>
  //       pickleStep.astNodeIds.includes(exampleRowId),
  //     );
  //     throwIf(pickleSteps.length > 1, `Several pickle steps found for scenario step: ${step.text}`);
  //   }
  //   throwIf(pickleSteps.length === 0, `Pickle step not found for scenario step: ${step.text}`);
  //   // several pickle steps should be found only for bg steps
  //   // it's ok to take the first for bg
  //   return pickleSteps[0];
  // }

  // private getStepEnglishKeyword(step: Step) {
  //   const keywordLocal = step.keyword.trim();
  //   let keywordEng;
  //   if (keywordLocal === '*') {
  //     keywordEng = 'And';
  //   } else if (this.i18nKeywordsMap) {
  //     keywordEng = this.i18nKeywordsMap.get(keywordLocal);
  //   } else {
  //     keywordEng = keywordLocal;
  //   }
  //   if (!keywordEng) throw new Error(`Keyword not found: ${keywordLocal}`);
  //   return keywordEng as StepFixtureName;
  // }

  // private getStepFixtureNames({ definition }: MatchedStepDefinition) {
  //   // for cucumber-style there is no fixtures arg,
  //   // fixtures are accessible via this.world
  //   if (definition.isCucumberStyle()) return [];

  //   return fixtureParameterNames(definition.fn) // prettier-ignore
  //     .filter((name) => !isBddAutoInjectFixture(name));
  // }

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

    if (worldFixtureNames.size > 1) {
      throw new Error(
        [
          `All steps in a feature file should have the same worldFixture.`,
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
      importTestFrom = new ImportTestFromGuesser(
        this.featureUri,
        this.getUsedDefinitions(),
        this.getUsedPomFixtures(),
        this.hooks.getCustomTests(),
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
