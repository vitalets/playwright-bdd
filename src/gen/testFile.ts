/**
 * Generate test code.
 */

/* eslint-disable max-lines, max-params */

import {
  GherkinDocument,
  FeatureChild,
  RuleChild,
  Scenario,
  Background,
  Step,
  PickleStep,
  Pickle,
  Feature,
  Rule,
  Examples,
  TableRow,
} from '@cucumber/messages';
import fs from 'node:fs';
import path from 'node:path';
import { Formatter } from './formatter';
import { KeywordsMap, getKeywordsMap } from './i18n';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { findStepDefinition } from '../cucumber/loadSteps';
import { extractFixtureNames } from '../stepDefinitions/createBdd';
import { BDDConfig } from '../config';
import { KeywordType, getStepKeywordType } from '@cucumber/cucumber/lib/formatter/helpers/index';
import { template } from '../utils';
import { TestPoms, buildFixtureTag } from './testPoms';
import parseTagsExpression from '@cucumber/tag-expressions';
import { TestNode } from './testNode';
import { getStepConfig, isDecorator, isPlaywrightStyle } from '../stepDefinitions/stepConfig';
import { PomNode } from '../stepDefinitions/decorators/poms';
import { exit } from '../utils/exit';

type TestFileOptions = {
  doc: GherkinDocument;
  pickles: Pickle[];
  supportCodeLibrary: ISupportCodeLibrary;
  outputPath: string;
  config: BDDConfig;
  tagsExpression?: ReturnType<typeof parseTagsExpression>;
};

// Decorator steps handled after all steps to resolve fixtures correctly
type PreparedDecoratorStep = {
  index: number;
  keyword: string;
  pickleStep: PickleStep;
  pomNode: PomNode;
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
  public testNodes: TestNode[] = [];
  public hasCustomTest = false;
  public undefinedSteps: UndefinedStep[] = [];

  constructor(private options: TestFileOptions) {
    this.formatter = new Formatter(options.config);
  }

  get sourceFile() {
    const { uri } = this.options.doc;
    if (!uri) throw new Error(`Document without uri`);
    return uri;
  }

  get content() {
    return this.lines.join('\n');
  }

  get language() {
    return this.options.doc.feature?.language || 'en';
  }

  get config() {
    return this.options.config;
  }

  get outputPath() {
    return this.options.outputPath;
  }

  build() {
    this.loadI18nKeywords();
    this.lines = [
      ...this.getFileHeader(), // prettier-ignore
      ...this.getRootSuite(),
      ...this.getFileFixtures(),
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
    return this.formatter.fileHeader(this.sourceFile, importTestFrom);
  }

  private loadI18nKeywords() {
    if (this.language !== 'en') {
      this.i18nKeywordsMap = getKeywordsMap(this.language);
    }
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

  private getFileFixtures() {
    return this.formatter.useFixtures([
      ...this.formatter.testFixture(),
      ...this.formatter.tagsFixture(this.testNodes),
    ]);
  }

  private getRootSuite() {
    const { feature } = this.options.doc;
    if (!feature) throw new Error(`Document without feature.`);
    return this.getSuite(feature);
  }

  /**
   * Generate test.describe suite for root Feature or Rule
   */
  private getSuite(feature: Feature | Rule, parent?: TestNode) {
    const node = new TestNode(feature, parent);
    const lines: string[] = [];
    // const { backgrounds, rules, scenarios } =
    // bgFixtures, bgTags - used as fixture hints for decorator steps
    feature.children.forEach((child) => lines.push(...this.getSuiteChild(child, node)));
    return this.formatter.suite(node, lines);
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
    const lines: string[] = [];
    let exampleIndex = 0;
    scenario.examples.forEach((examples) => {
      const titleFormat = this.getExamplesTitleFormat(examples);
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
    return this.formatter.suite(node, lines);
  }

  /**
   * Generate test from Examples row of Scenario Outline
   */
  // eslint-disable-next-line max-params
  private getOutlineTest(
    scenario: Scenario,
    examples: Examples,
    exampleRow: TableRow,
    title: string,
    parent: TestNode,
  ) {
    const node = new TestNode({ name: title, tags: examples.tags }, parent);
    if (this.skipByTagsExpression(node)) return [];
    this.testNodes.push(node);
    const { fixtures, lines } = this.getSteps(scenario, node.tags, exampleRow.id);
    return this.formatter.test(node, fixtures, lines);
  }

  /**
   * Generate test from Scenario
   */
  private getTest(scenario: Scenario, parent: TestNode) {
    const node = new TestNode(scenario, parent);
    if (this.skipByTagsExpression(node)) return [];
    this.testNodes.push(node);
    const { fixtures, lines } = this.getSteps(scenario, node.tags);
    return this.formatter.test(node, fixtures, lines);
  }

  /**
   * Generate test steps
   */
  private getSteps(scenario: Scenario | Background, tags?: string[], outlineExampleRowId?: string) {
    const testFixtureNames = new Set<string>();
    const testPoms = new TestPoms(scenario.name || 'Background');
    const decoratorSteps: PreparedDecoratorStep[] = [];

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
        testPoms.addByStep(stepConfig.pomNode);
        decoratorSteps.push({ index, keyword, pickleStep, pomNode: stepConfig.pomNode });
      }

      return line;
    });

    // decorator steps handled in second pass to guess fixtures
    if (decoratorSteps.length) {
      testFixtureNames.forEach((fixtureName) => testPoms.addByFixtureName(fixtureName));
      tags?.forEach((tag) => testPoms.addByTag(tag));
      testPoms.resolveFixtures();
      decoratorSteps.forEach((step) => {
        const { line, fixtureName } = this.getDecoratorStep(step, testPoms);
        lines[step.index] = line;
        testFixtureNames.add(fixtureName);
      });
    }

    return { fixtures: testFixtureNames, lines };
  }

  /**
   * Generate step for Given, When, Then
   */
  // eslint-disable-next-line max-statements, complexity
  private getStep(
    step: Step,
    previousKeywordType: KeywordType | undefined,
    outlineExampleRowId?: string,
  ) {
    const pickleStep = this.getPickleStep(step, outlineExampleRowId);
    const stepDefinition = findStepDefinition(
      this.options.supportCodeLibrary,
      pickleStep.text,
      this.sourceFile,
    );
    const keywordType = getStepKeywordType({
      keyword: step.keyword,
      language: this.language,
      previousKeywordType,
    });
    let keyword = this.getStepKeyword(step);
    if (!stepDefinition) {
      this.undefinedSteps.push({ keywordType, step, pickleStep });
      return this.getMissingStep(keyword, keywordType, pickleStep);
    }

    // for cucumber-style stepConfig is undefined
    const stepConfig = getStepConfig(stepDefinition);
    if (stepConfig?.hasCustomTest) this.hasCustomTest = true;

    // for cucumber-style transform Given/When/Then -> Given_/When_/Then_
    // to use own bddWorld (containing PW built-in fixtures)
    if (!isPlaywrightStyle(stepConfig)) keyword = `${keyword}_`;

    // for decorator steps fixtureNames are defined later in second pass
    const fixtureNames = isDecorator(stepConfig) ? [] : extractFixtureNames(stepConfig?.fn);
    const line = isDecorator(stepConfig)
      ? ''
      : this.formatter.step(keyword, pickleStep.text, pickleStep.argument, fixtureNames);

    return {
      keyword,
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

  private getPickleStep(step: Step, outlineExampleRowId?: string) {
    for (const pickle of this.options.pickles) {
      const pickleStep = pickle.steps.find(({ astNodeIds }) => {
        const hasStepId = astNodeIds.includes(step.id);
        const hasRowId = !outlineExampleRowId || astNodeIds.includes(outlineExampleRowId);
        return hasStepId && hasRowId;
      });
      if (pickleStep) return pickleStep;
    }

    throw new Error(`Pickle step not found for step: ${step.text}`);
  }

  private getStepKeyword(step: Step) {
    const origKeyword = step.keyword.trim();
    const enKeyword = origKeyword === '*' ? 'And' : this.getEnglishKeyword(origKeyword);
    if (!enKeyword) throw new Error(`Keyword not found: ${origKeyword}`);
    return enKeyword;
  }

  private getDecoratorStep(step: PreparedDecoratorStep, testPoms: TestPoms) {
    const { keyword, pickleStep, pomNode } = step;
    const resolvedFixtures = testPoms.getResolvedFixtures(pomNode);

    if (resolvedFixtures.length !== 1) {
      const suggestedTags = resolvedFixtures
        .filter((f) => !f.byTag)
        .map((f) => buildFixtureTag(f.name))
        .join(', ');

      const suggestedTagsStr = suggestedTags.length
        ? ` or set one of the following tags: ${suggestedTags}`
        : '.';

      exit(
        `Can't guess fixture for decorator step "${pickleStep.text}" in file: ${this.sourceFile}.`,
        `Please refactor your Page Object classes${suggestedTagsStr}`,
      );
    }

    const fixtureName = resolvedFixtures[0].name;

    return {
      fixtureName,
      line: this.formatter.step(keyword, pickleStep.text, pickleStep.argument, [fixtureName]),
    };
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

  private getExamplesTitleFormat(examples: Examples) {
    const { line } = examples.location;
    const titleFormatCommentLine = line - 1;
    const comment = this.options.doc.comments.find((c) => {
      return c.location.line === titleFormatCommentLine;
    });
    const commentText = comment?.text?.trim();
    const prefix = '# title-format:';
    return commentText?.startsWith(prefix)
      ? commentText.replace(prefix, '').trim()
      : this.config.examplesTitleFormat;
  }

  private skipByTagsExpression(node: TestNode) {
    // see: https://github.com/cucumber/tag-expressions/tree/main/javascript
    return this.options.tagsExpression?.evaluate(node.tags) === false;
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
}
