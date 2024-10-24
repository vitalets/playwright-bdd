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
  PickleStep,
  Feature,
  Rule,
  Examples,
  TableRow,
} from '@cucumber/messages';
import path from 'node:path';
import { Formatter, StepFixtureName } from './formatter';
import { KeywordsMap, getKeywordsMap } from './i18n';
import { stringifyLocation, throwIf } from '../utils';
import parseTagsExpression from '@cucumber/tag-expressions';
import { TestNode } from './testNode';
import {
  GeneralScenarioHook,
  getScenarioHooksFixtureNames,
  getScenarioHooksToRun,
  ScenarioHookType,
} from '../hooks/scenario';
import { getWorkerHooksFixtures } from '../hooks/worker';
import { LANG_EN, isEnglish } from '../config/lang';
import { BddMetaBuilder } from './bddMetaBuilder';
import { GherkinDocumentWithPickles } from '../features/types';
import { DecoratorSteps } from './decoratorSteps';
import { BDDConfig } from '../config/types';
import { KeywordType, mapStepsToKeywordTypes } from '../cucumber/keywordType';
import { ImportTestFromGuesser } from './importTestFrom';
import { isBddAutoInjectFixture } from '../run/bddFixtures/autoInject';
import { fixtureParameterNames } from '../playwright/fixtureParameterNames';
import { GherkinDocumentQuery } from '../features/documentQuery';
import { ExamplesTitleBuilder } from './examplesTitleBuilder';
import { MissingStep } from '../snippets/types';
import { getStepTextWithKeyword } from '../features/helpers';
import { formatDuplicateStepsMessage, StepFinder } from '../steps/finder';
import { exit } from '../utils/exit';
import { StepDefinition } from '../steps/stepDefinition';

type TestFileOptions = {
  gherkinDocument: GherkinDocumentWithPickles;
  outputPath: string;
  config: BDDConfig;
  tagsExpression?: ReturnType<typeof parseTagsExpression>;
};

export class TestFile {
  private lines: string[] = [];
  private i18nKeywordsMap?: KeywordsMap;
  private formatter: Formatter;
  private usedDecoratorFixtures = new Set<string>();
  private gherkinDocumentQuery: GherkinDocumentQuery;
  private bddMetaBuilder: BddMetaBuilder;
  private stepFinder: StepFinder;
  private testNodesToRun: TestNode[] = [];

  public missingSteps: MissingStep[] = [];
  public featureUri: string;
  public usedStepDefinitions = new Set<StepDefinition>();

  constructor(private options: TestFileOptions) {
    this.formatter = new Formatter(options.config);
    this.gherkinDocumentQuery = new GherkinDocumentQuery(this.gherkinDocument);
    this.bddMetaBuilder = new BddMetaBuilder(this.gherkinDocumentQuery);
    this.featureUri = this.getFeatureUri();
    this.stepFinder = new StepFinder(options.config);
  }

  get gherkinDocument() {
    return this.options.gherkinDocument;
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

  get outputPath() {
    return this.options.outputPath;
  }

  get testCount() {
    return this.bddMetaBuilder.testCount;
  }

  build(): this {
    if (!this.gherkinDocumentQuery.hasPickles()) return this;
    this.loadI18nKeywords();
    // important to calc suites first, b/c header depend on used steps and used tags
    const suites = this.getRootSuite();

    this.lines = [
      ...this.getFileHeader(), // prettier-ignore
      ...this.getScenarioHooksCalls(),
      ...suites,
      ...this.getTechnicalSection(),
    ];
    return this;
  }

  private getFileHeader() {
    const importTestFrom = this.resolveImportTestFrom();
    return this.formatter.fileHeader(this.featureUri, importTestFrom);
  }

  private loadI18nKeywords() {
    if (!this.isEnglish) {
      this.i18nKeywordsMap = getKeywordsMap(this.language);
    }
  }

  private getFeatureUri() {
    const { uri } = this.gherkinDocument;
    if (!uri) throw new Error(`Document without uri: ${this.gherkinDocument.feature?.name}`);
    return uri;
  }

  private resolveImportTestFrom() {
    let { importTestFrom } = this.config;
    if (!importTestFrom) {
      importTestFrom = new ImportTestFromGuesser(
        this.featureUri,
        this.usedStepDefinitions,
        this.usedDecoratorFixtures,
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

  private getTechnicalSection() {
    const worldFixtureName = this.getWorldFixtureName();

    const fixtures = this.formatter.fixtures([
      ...this.formatter.testFixture(),
      ...this.formatter.uriFixture(this.featureUri),
      ...this.bddMetaBuilder.getFixture(),
      // ...this.formatter.scenarioHookFixtures(getScenarioHooksFixtures()),
      ...this.formatter.workerHookFixtures(getWorkerHooksFixtures()),
      ...(worldFixtureName ? this.formatter.worldFixture(worldFixtureName) : []),
    ]);

    return [
      ...fixtures, // prettier-ignore
      ...this.bddMetaBuilder.getObject(),
    ];
  }

  private getRootSuite() {
    const { feature } = this.gherkinDocument;
    if (!feature) throw new Error(`Document without feature.`);
    return this.getSuite(feature);
  }

  /**
   * Generate test.describe suite for root Feature or Rule
   */
  private getSuite(feature: Feature | Rule, parent?: TestNode) {
    const node = new TestNode(feature, parent);
    if (this.isSkippedBySpecialTag(node)) return this.formatter.describe(node, []);
    const lines: string[] = [];
    feature.children.forEach((child) => lines.push(...this.getSuiteChild(child, node)));
    return this.formatter.describe(node, lines);
  }

  private getSuiteChild(child: FeatureChild | RuleChild, parent: TestNode) {
    if ('rule' in child && child.rule) return this.getSuite(child.rule, parent);
    if (child.background) return this.getBeforeEach(child.background, parent);
    if (child.scenario) return this.getScenarioLines(child.scenario, parent);
    throw new Error(`Empty child: ${JSON.stringify(child)}`);
  }

  private getScenarioLines(scenario: Scenario, parent: TestNode) {
    return this.isOutline(scenario)
      ? this.getOutlineSuite(scenario, parent)
      : this.getTest(scenario, parent);
  }

  /**
   * Generate test.beforeEach for Background
   */
  private getBeforeEach(bg: Background, parent: TestNode) {
    const node = new TestNode({ name: 'background', tags: [] }, parent);
    const title = [bg.keyword, bg.name].filter(Boolean).join(': ');
    const { fixtures, lines, hasMissingSteps } = this.getSteps(bg, node.tags);
    // for bg we pass parent as node to forceFixme if needed
    this.handleMissingStepsInScenario(hasMissingSteps, parent);
    return this.formatter.beforeEach(title, fixtures, lines);
  }

  private getScenarioHooksCalls() {
    const lines = [
      ...this.getScenarioHooksCall('before'), // prettier-ignore
      ...this.getScenarioHooksCall('after'),
    ];
    if (lines.length) lines.push('');
    return lines;
  }

  private getScenarioHooksCall(type: ScenarioHookType) {
    const hooksToRun = new Set<GeneralScenarioHook>();
    this.testNodesToRun.forEach((node) => {
      const hooksToRunForNode = getScenarioHooksToRun(type, node.tags);
      hooksToRunForNode.forEach((hook) => hooksToRun.add(hook));
    });
    if (!hooksToRun.size) return [];
    const fixtureNames = getScenarioHooksFixtureNames([...hooksToRun]);
    return this.formatter.scenarioHooksCall(type, fixtureNames);
  }

  /**
   * Generate test.describe suite for Scenario Outline
   */
  private getOutlineSuite(scenario: Scenario, parent: TestNode) {
    const node = new TestNode(scenario, parent);
    if (this.isSkippedBySpecialTag(node)) return this.formatter.describe(node, []);
    const lines: string[] = [];
    const examplesTitleBuilder = this.createExamplesTitleBuilder(scenario);
    scenario.examples.forEach((examples) => {
      examples.tableBody.forEach((exampleRow) => {
        const testTitle = examplesTitleBuilder.buildTitle(examples, exampleRow);
        const testLines = this.getOutlineTest(scenario, examples, exampleRow, testTitle, node);
        lines.push(...testLines);
      });
    });
    return this.formatter.describe(node, lines);
  }

  /**
   * Generate test from Examples row of Scenario Outline
   */
  private getOutlineTest(
    scenario: Scenario,
    examples: Examples,
    exampleRow: TableRow,
    title: string,
    parent: TestNode,
  ) {
    const node = new TestNode({ name: title, tags: examples.tags }, parent);
    if (this.isSkippedByTagsExpression(node)) return [];
    this.bddMetaBuilder.registerTest(node, exampleRow.id);
    if (this.isSkippedBySpecialTag(node)) return this.formatter.test(node, new Set(), []);
    const { fixtures, lines, hasMissingSteps } = this.getSteps(scenario, node.tags, exampleRow.id);
    this.handleMissingStepsInScenario(hasMissingSteps, node);
    if (!node.isSkipped()) this.testNodesToRun.push(node);
    return this.formatter.test(node, fixtures, lines);
  }

  /**
   * Generate test from Scenario
   */
  private getTest(scenario: Scenario, parent: TestNode) {
    const node = new TestNode(scenario, parent);
    if (this.isSkippedByTagsExpression(node)) return [];
    this.bddMetaBuilder.registerTest(node, scenario.id);
    if (this.isSkippedBySpecialTag(node)) return this.formatter.test(node, new Set(), []);
    const { fixtures, lines, hasMissingSteps } = this.getSteps(scenario, node.tags);
    this.handleMissingStepsInScenario(hasMissingSteps, node);
    if (!node.isSkipped()) this.testNodesToRun.push(node);
    return this.formatter.test(node, fixtures, lines);
  }

  /**
   * Generate test steps
   */
  private getSteps(scenario: Scenario | Background, tags?: string[], outlineExampleRowId?: string) {
    const testFixtureNames = new Set<string>();
    const decoratorSteps = new DecoratorSteps({
      statefulPoms: this.config.statefulPoms,
      featureUri: this.featureUri,
      testTitle: scenario.name || 'Background',
      testFixtureNames,
      testTags: tags,
    });

    const stepToKeywordType = mapStepsToKeywordTypes(scenario.steps, this.language);
    let hasMissingSteps = false;

    // todo: refactor internal fn, move to a separate class.
    // The problem - it is highly coupled with the testFile class,
    // need to pass many params: config, language, featureUri, i18nKeywordsMap, gherkinDocument, etc...
    // eslint-disable-next-line max-statements
    const lines = scenario.steps.map((step, index) => {
      const keywordType = stepToKeywordType.get(step)!;
      const keywordEng = this.getStepEnglishKeyword(step);
      testFixtureNames.add(keywordEng);
      this.bddMetaBuilder.registerStep(step, keywordType);
      // pickleStep contains step text with inserted example values and argument
      const pickleStep = this.findPickleStep(step, outlineExampleRowId);
      const stepDefinition = this.findStepDefinition(keywordType, step, pickleStep, tags);
      if (!stepDefinition) {
        hasMissingSteps = true;
        return this.handleMissingStep(keywordEng, keywordType, pickleStep, step);
      }

      this.usedStepDefinitions.add(stepDefinition);

      if (stepDefinition.isDecorator()) {
        decoratorSteps.push({
          index,
          keywordEng,
          pickleStep,
          pomNode: stepDefinition.pomNode,
        });

        // for decorator steps, line and fixtureNames are filled later in second pass
        return '';
      }

      const stepFixtureNames = this.getStepFixtureNames(stepDefinition);
      stepFixtureNames.forEach((fixtureName) => testFixtureNames.add(fixtureName));

      return this.formatter.step(
        keywordEng,
        pickleStep.text,
        pickleStep.argument,
        stepFixtureNames,
      );
    });

    // fill decorator step slots in second pass (to guess fixtures)
    // TODO: for background steps we can delay resolving fixtures
    // until all scenarios steps are processed. After that we know all used fixtures,
    // and can guess background fixtures more precisely.
    // But for statefulPoms=false (that is default) it is not very important.
    decoratorSteps.resolveFixtureNames();
    decoratorSteps.forEach(({ index, keywordEng, pickleStep, fixtureName }) => {
      testFixtureNames.add(fixtureName);
      this.usedDecoratorFixtures.add(fixtureName);
      const stepFixtureNames = [fixtureName];
      lines[index] = this.formatter.step(
        keywordEng,
        pickleStep.text,
        pickleStep.argument,
        stepFixtureNames,
      );
    });

    return { fixtures: testFixtureNames, lines, hasMissingSteps };
  }

  private findStepDefinition(
    keywordType: KeywordType,
    scenarioStep: Step,
    pickleStep: PickleStep,
    tags?: string[],
  ) {
    const stepDefinitions = this.stepFinder.findDefinitions(keywordType, pickleStep.text, tags);

    if (stepDefinitions.length > 1) {
      const stepTextWithKeyword = getStepTextWithKeyword(scenarioStep.keyword, pickleStep.text);
      const stepLocation = `${this.featureUri}:${stringifyLocation(scenarioStep.location)}`;
      // todo: maybe not exit and collect all duplicates?
      exit(formatDuplicateStepsMessage(stepDefinitions, stepTextWithKeyword, stepLocation));
    }

    return stepDefinitions[0];
  }

  private handleMissingStep(
    keywordEng: StepFixtureName,
    keywordType: KeywordType,
    pickleStep: PickleStep,
    step: Step,
  ) {
    const { line, column } = step.location;
    this.missingSteps.push({
      location: { uri: this.featureUri, line, column },
      textWithKeyword: getStepTextWithKeyword(step.keyword, pickleStep.text),
      keywordType,
      pickleStep,
    });
    return this.formatter.missingStep(keywordEng, pickleStep.text);
  }

  private findPickleStep(step: Step, exampleRowId?: string) {
    let pickleSteps = this.gherkinDocumentQuery.getPickleSteps(step.id);
    if (exampleRowId) {
      pickleSteps = pickleSteps.filter((pickleStep) =>
        pickleStep.astNodeIds.includes(exampleRowId),
      );
      throwIf(pickleSteps.length > 1, `Several pickle steps found for scenario step: ${step.text}`);
    }
    throwIf(pickleSteps.length === 0, `Pickle step not found for scenario step: ${step.text}`);
    // several pickle steps should be found only for bg steps
    // it's ok to take the first for bg
    return pickleSteps[0];
  }

  private getStepEnglishKeyword(step: Step) {
    const keywordLocal = step.keyword.trim();
    let keywordEng;
    if (keywordLocal === '*') {
      keywordEng = 'And';
    } else if (this.i18nKeywordsMap) {
      keywordEng = this.i18nKeywordsMap.get(keywordLocal);
    } else {
      keywordEng = keywordLocal;
    }
    if (!keywordEng) throw new Error(`Keyword not found: ${keywordLocal}`);
    return keywordEng as StepFixtureName;
  }

  private getStepFixtureNames(stepDefinition: StepDefinition) {
    // for cucumber-style there is no fixtures arg,
    // fixtures are accessible via this.world
    if (stepDefinition.isCucumberStyle()) return [];

    return fixtureParameterNames(stepDefinition.fn) // prettier-ignore
      .filter((name) => !isBddAutoInjectFixture(name));
  }

  private isSkippedByTagsExpression(node: TestNode) {
    // see: https://github.com/cucumber/tag-expressions/tree/main/javascript
    const { tagsExpression } = this.options;
    return tagsExpression && !tagsExpression.evaluate(node.tags);
  }

  // this fn is for consistency with isSkippedByTagsExpression(node)
  private isSkippedBySpecialTag(node: TestNode) {
    return node.isSkipped();
  }

  private isOutline(scenario: Scenario) {
    // scenario outline without 'Examples:' block behaves like a usual scenario
    return Boolean(scenario.examples?.length);
  }

  private getWorldFixtureName() {
    const worldFixtureNames = new Set<string>();

    this.usedStepDefinitions.forEach(({ worldFixture }) => {
      if (worldFixture) worldFixtureNames.add(worldFixture);
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

  private handleMissingStepsInScenario(hasMissingSteps: boolean, node: TestNode) {
    if (hasMissingSteps && this.config.missingSteps === 'skip-scenario') {
      node.specialTags.forceFixme();
    }
  }
}
