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
import fs from 'node:fs';
import path from 'node:path';
import { Formatter } from './formatter';
import { KeywordsMap, getKeywordsMap } from './i18n';
import { findStepDefinition } from '../cucumber/findStep';
import { KeywordType, getStepKeywordType } from '@cucumber/cucumber/lib/formatter/helpers/index';
import { extractTemplateParams, template } from '../utils';
import parseTagsExpression from '@cucumber/tag-expressions';
import { TestNode } from './testNode';
import {
  getStepConfig,
  isDecorator,
  isDefinedViaCucumber,
  isUsingWorldFixture,
} from '../steps/stepConfig';
import { extractFixtureNames, extractFixtureNamesFromFnBodyMemo } from './fixtures';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { getScenarioHooksFixtures, hasScenarioHooksWithWorldFromCucumber } from '../hooks/scenario';
import { getWorkerHooksFixtures } from '../hooks/worker';
import { LANG_EN, isEnglish } from '../config/lang';
import { ISupportCodeLibrary } from '../cucumber/types';
import { TestMetaBuilder } from './testMeta';
import { GherkinDocumentWithPickles } from '../cucumber/loadFeatures';
import { DecoratorSteps } from './decoratorSteps';
import { BDDConfig } from '../config/types';

type TestFileOptions = {
  gherkinDocument: GherkinDocumentWithPickles;
  supportCodeLibrary: ISupportCodeLibrary;
  outputPath: string;
  config: BDDConfig;
  tagsExpression?: ReturnType<typeof parseTagsExpression>;
};

export type UndefinedStep = {
  keywordType: KeywordType;
  step: Step;
  pickleStep: PickleStep;
};

export class TestFile {
  private lines: string[] = [];
  private i18nKeywordsMap?: KeywordsMap;
  private formatter: Formatter;
  private testMetaBuilder: TestMetaBuilder;
  public hasCustomTest = false;
  public undefinedSteps: UndefinedStep[] = [];
  public featureUri: string;
  public usedStepDefinitions = new Set<StepDefinition>();

  constructor(private options: TestFileOptions) {
    this.formatter = new Formatter(options.config);
    this.testMetaBuilder = new TestMetaBuilder();
    this.featureUri = this.getFeatureUri();
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
    return this.testMetaBuilder.testCount;
  }

  build() {
    if (!this.pickles.length) return this;
    this.loadI18nKeywords();
    this.lines = [
      ...this.getFileHeader(), // prettier-ignore
      ...this.getRootSuite(),
      ...this.getTechnicalSection(),
    ];
    return this;
  }

  save() {
    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.outputPath, this.content);
  }

  private getFileHeader() {
    const importTestFrom = this.getRelativeImportTestFrom();
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

  private getRelativeImportTestFrom() {
    const { importTestFrom } = this.config;
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
    return this.formatter.technicalSection(this.testMetaBuilder, this.featureUri, [
      ...(!this.isEnglish ? this.formatter.langFixture(this.language) : []),
      ...(hasScenarioHooksWithWorldFromCucumber() || this.hasStepsDefinedViaCucumber()
        ? this.formatter.bddWorldFixtures()
        : []),
      ...this.formatter.scenarioHookFixtures(getScenarioHooksFixtures()),
      ...this.formatter.workerHookFixtures(getWorkerHooksFixtures()),
      ...(worldFixtureName ? this.formatter.newCucumberStyleWorldFixture(worldFixtureName) : []),
    ]);
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
    if (node.isSkipped()) return this.formatter.describe(node, []);
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
    const { fixtures, lines } = this.getSteps(bg, node.tags);
    return this.formatter.beforeEach(fixtures, lines);
  }

  /**
   * Generate test.describe suite for Scenario Outline
   */
  private getOutlineSuite(scenario: Scenario, parent: TestNode) {
    const node = new TestNode(scenario, parent);
    if (node.isSkipped()) return this.formatter.describe(node, []);
    const lines: string[] = [];
    let exampleIndex = 0;
    scenario.examples.forEach((examples) => {
      const titleFormat = this.getExamplesTitleFormat(scenario, examples);
      examples.tableBody.forEach((exampleRow) => {
        const testTitle = this.getOutlineTestTitle(
          titleFormat,
          examples,
          exampleRow,
          ++exampleIndex,
        );
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
    if (this.skipByTagsExpression(node)) return [];
    const pickle = this.findPickle(scenario, exampleRow);
    this.testMetaBuilder.registerTest(node, pickle);
    if (node.isSkipped()) return this.formatter.test(node, new Set(), []);
    const { fixtures, lines } = this.getSteps(scenario, node.tags, exampleRow.id);
    return this.formatter.test(node, fixtures, lines);
  }

  /**
   * Generate test from Scenario
   */
  private getTest(scenario: Scenario, parent: TestNode) {
    const node = new TestNode(scenario, parent);
    if (this.skipByTagsExpression(node)) return [];
    const pickle = this.findPickle(scenario);
    this.testMetaBuilder.registerTest(node, pickle);
    if (node.isSkipped()) return this.formatter.test(node, new Set(), []);
    const { fixtures, lines } = this.getSteps(scenario, node.tags);
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

    let previousKeywordType: KeywordType | undefined = undefined;

    const lines = scenario.steps.map((step, index) => {
      const {
        keyword,
        keywordType,
        fixtureNames: stepFixtureNames,
        line,
        pickleStep,
        stepConfig,
      } = this.getStep(step, previousKeywordType, outlineExampleRowId);

      previousKeywordType = keywordType;

      testFixtureNames.add(keyword);
      stepFixtureNames.forEach((fixtureName) => testFixtureNames.add(fixtureName));
      if (isDecorator(stepConfig)) {
        decoratorSteps.push({ index, keyword, pickleStep, pomNode: stepConfig.pomNode });
      }

      return line;
    });

    // fill decorator step slots in second pass (to guess fixtures)
    // TODO: for background steps we can delay resolving fixtures
    // until all scenarios steps are processed. After that we know all used fixtures,
    // and can guess background fixtures more precisely.
    // But for statefulPoms=false (that is default) it is not very important.
    decoratorSteps.resolveFixtureNames();
    decoratorSteps.forEach(({ index, keyword, pickleStep, fixtureName }) => {
      testFixtureNames.add(fixtureName);
      lines[index] = this.formatter.step(keyword, pickleStep.text, pickleStep.argument, [
        fixtureName,
      ]);
    });

    return { fixtures: testFixtureNames, lines };
  }

  /**
   * Generate step for Given, When, Then
   */
  // eslint-disable-next-line max-statements
  private getStep(
    step: Step,
    previousKeywordType: KeywordType | undefined,
    outlineExampleRowId?: string,
  ) {
    const pickleStep = this.findPickleStep(step, outlineExampleRowId);
    const stepDefinition = findStepDefinition(
      this.options.supportCodeLibrary,
      pickleStep.text,
      this.featureUri,
    );
    const keywordType = getStepKeywordType({
      keyword: step.keyword,
      language: this.language,
      previousKeywordType,
    });

    const enKeyword = this.getStepEnglishKeyword(step);
    if (!stepDefinition) {
      this.undefinedSteps.push({ keywordType, step, pickleStep });
      return this.getMissingStep(enKeyword, keywordType, pickleStep);
    }

    this.usedStepDefinitions.add(stepDefinition);

    // for old cucumber-style stepConfig is undefined
    const stepConfig = getStepConfig(stepDefinition);
    if (stepConfig?.hasCustomTest) this.hasCustomTest = true;

    const fixtureNames = this.getStepFixtureNames(stepDefinition);
    const line = isDecorator(stepConfig)
      ? ''
      : this.formatter.step(enKeyword, pickleStep.text, pickleStep.argument, fixtureNames);

    return {
      keyword: enKeyword,
      keywordType,
      fixtureNames,
      line,
      pickleStep,
      stepConfig,
    };
  }

  private getMissingStep(keyword: string, keywordType: KeywordType, pickleStep: PickleStep) {
    return {
      keyword,
      keywordType,
      fixtureNames: [],
      line: this.formatter.missingStep(keyword, pickleStep.text),
      pickleStep,
      stepConfig: undefined,
    };
  }

  /**
   * Returns pickle for scenario.
   * Pickle is executable entity including background and steps with example values.
   */
  private findPickle(scenario: Scenario, exampleRow?: TableRow) {
    const pickle = this.pickles.find((pickle) => {
      const hasScenarioId = pickle.astNodeIds.includes(scenario.id);
      const hasExampleRowId = !exampleRow || pickle.astNodeIds.includes(exampleRow.id);
      return hasScenarioId && hasExampleRowId;
    });

    if (!pickle) {
      throw new Error(`Pickle not found for scenario: ${scenario.name}`);
    }

    return pickle;
  }

  /**
   * Returns pickleStep for ast step.
   * PickleStep contains step text with inserted example values.
   *
   * Note:
   * When searching for pickleStep iterate all pickles in a file
   * b/c for background steps there is no own pickle.
   * This can be optimized: pass optional 'pickle' parameter
   * and search only inside it if it exists.
   * But this increases code complexity, and performance impact seems to be minimal
   * b/c number of pickles inside feature file is not very big.
   */
  private findPickleStep(step: Step, exampleRowId?: string) {
    for (const pickle of this.pickles) {
      const pickleStep = pickle.steps.find(({ astNodeIds }) => {
        const hasStepId = astNodeIds.includes(step.id);
        const hasRowId = !exampleRowId || astNodeIds.includes(exampleRowId);
        return hasStepId && hasRowId;
      });
      if (pickleStep) return pickleStep;
    }

    throw new Error(`Pickle step not found for step: ${step.text}`);
  }

  private getStepEnglishKeyword(step: Step) {
    const nativeKeyword = step.keyword.trim();
    const enKeyword = nativeKeyword === '*' ? 'And' : this.getEnglishKeyword(nativeKeyword);
    if (!enKeyword) throw new Error(`Keyword not found: ${nativeKeyword}`);
    return enKeyword;
  }

  // eslint-disable-next-line complexity
  private getStepFixtureNames(stepDefinition: StepDefinition) {
    const stepConfig = getStepConfig(stepDefinition);
    if (isDefinedViaCucumber(stepConfig)) {
      return extractFixtureNamesFromFnBodyMemo(stepDefinition.code);
    }
    // for decorator steps fixtureNames are defined later in second pass
    if (isDecorator(stepConfig)) return [];
    // for new cucumber-style there is no fixtures arg
    if (isUsingWorldFixture(stepConfig)) return [];
    if (stepConfig?.fn) {
      return extractFixtureNames(stepConfig.fn);
    }
    return [];
  }

  private getOutlineTestTitle(
    titleFormat: string,
    examples: Examples,
    exampleRow: TableRow,
    exampleIndex: number,
  ) {
    const params: Record<string, unknown> = {
      _index_: exampleIndex,
    };

    exampleRow.cells.forEach((cell, index) => {
      const colName = examples.tableHeader?.cells[index]?.value;
      if (colName) params[colName] = cell.value;
    });

    return template(titleFormat, params);
  }

  private getExamplesTitleFormat(scenario: Scenario, examples: Examples) {
    return (
      this.getExamplesTitleFormatFromComment(examples) ||
      this.getExamplesTitleFormatFromScenarioName(scenario, examples) ||
      this.config.examplesTitleFormat
    );
  }

  private getExamplesTitleFormatFromComment(examples: Examples) {
    const { line } = examples.location;
    const titleFormatCommentLine = line - 1;
    const comment = this.gherkinDocument.comments.find((c) => {
      return c.location.line === titleFormatCommentLine;
    });
    const commentText = comment?.text?.trim();
    const prefix = '# title-format:';
    return commentText?.startsWith(prefix) ? commentText.replace(prefix, '').trim() : '';
  }

  private getExamplesTitleFormatFromScenarioName(scenario: Scenario, examples: Examples) {
    const columnsInScenarioName = extractTemplateParams(scenario.name);
    const hasColumnsFromExamples =
      columnsInScenarioName.length &&
      examples.tableHeader?.cells?.some((cell) => {
        return cell.value && columnsInScenarioName.includes(cell.value);
      });
    return hasColumnsFromExamples ? scenario.name : '';
  }

  private skipByTagsExpression(node: TestNode) {
    // see: https://github.com/cucumber/tag-expressions/tree/main/javascript
    const { tagsExpression } = this.options;
    return tagsExpression && !tagsExpression.evaluate(node.tags);
  }

  private isOutline(scenario: Scenario) {
    const keyword = this.getEnglishKeyword(scenario.keyword);
    return (
      keyword === 'ScenarioOutline' ||
      keyword === 'Scenario Outline' ||
      keyword === 'Scenario Template'
    );
  }

  private getEnglishKeyword(keyword: string) {
    return this.i18nKeywordsMap ? this.i18nKeywordsMap.get(keyword) : keyword;
  }

  private hasStepsDefinedViaCucumber() {
    return [...this.usedStepDefinitions].some((stepDefinition) => {
      return isDefinedViaCucumber(getStepConfig(stepDefinition));
    });
  }

  private getWorldFixtureName() {
    const worldFixtureNames = new Set<string>();

    this.usedStepDefinitions.forEach((stepDefinition) => {
      const worldFixture = getStepConfig(stepDefinition)?.worldFixture;
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
}
