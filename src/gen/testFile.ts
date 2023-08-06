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
import { exitWithMessage, template } from '../utils';
import { PomNode, getStepConfig, isPlaywrightStyle } from '../stepDefinitions/defineStep';
import { POMS, buildFixtureTag } from './poms';
import parseTagsExpression from '@cucumber/tag-expressions';
import { TestNode } from './testNode';

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
  private keywordsMap?: KeywordsMap;
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
      this.keywordsMap = getKeywordsMap(this.language);
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
    feature.children.forEach((child) => lines.push(...this.getSuiteChild(child, node)));
    return lines.length ? this.formatter.suite(node, lines) : [];
  }

  private getSuiteChild(child: FeatureChild | RuleChild, parent: TestNode) {
    if ('rule' in child && child.rule) return this.getSuite(child.rule, parent);
    if (child.background) return this.getBeforeEach(child.background);
    if (child.scenario) return this.getScenarioLines(child.scenario, parent);
    throw new Error(`Empty child: ${JSON.stringify(child)}`);
  }

  private getScenarioLines(scenario: Scenario, parent: TestNode) {
    return isOutline(scenario)
      ? this.getOutlineSuite(scenario, parent)
      : this.getTest(scenario, parent);
  }

  /**
   * Generate test.beforeEach for Background
   */
  private getBeforeEach(bg: Background) {
    const { fixtures, lines } = this.getSteps(bg);
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
   * Generate test from Examples row
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
    this.testNodes.push(node);
    const { fixtures, lines } = this.getSteps(scenario, node.ownTags, exampleRow.id);
    return this.formatter.test(node, fixtures, lines);
  }

  /**
   * Generate test from Scenario
   */
  private getTest(scenario: Scenario, parent: TestNode) {
    const node = new TestNode(scenario, parent);
    this.testNodes.push(node);
    const { fixtures, lines } = this.getSteps(scenario, node.ownTags);
    return this.formatter.test(node, fixtures, lines);
  }

  /**
   * Generate test steps
   */
  private getSteps(
    scenario: Scenario | Background,
    ownTestTags?: string[],
    outlineExampleRowId?: string,
  ) {
    const testFixtureNames = new Set<string>();
    const usedPoms = new POMS();
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

      if (!line && stepConfig?.pomNode) {
        usedPoms.add(stepConfig.pomNode);
        decoratorSteps.push({ index, keyword, pickleStep, pomNode: stepConfig.pomNode });
      }

      return line;
    });

    if (decoratorSteps.length) {
      testFixtureNames.forEach((fixtureName) => usedPoms.addByFixtureName(fixtureName));
      ownTestTags?.forEach((tag) => usedPoms.addByTag(tag));
      decoratorSteps.forEach((step) => {
        const { line, fixtureNames } = this.getDecoratorStep(step, usedPoms);
        lines[step.index] = line;
        fixtureNames.forEach((fixtureName) => testFixtureNames.add(fixtureName));
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
    // to use fixtures with own bddWorld (containing fixtures)
    if (!isPlaywrightStyle(stepDefinition)) keyword = `${keyword}_`;
    // for decorator steps fixtures defined later in second pass
    const fixtureNames = stepConfig?.isDecorator ? [] : extractFixtureNames(stepConfig?.fn);
    const line = stepConfig?.isDecorator
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
    let enKeyword;
    if (origKeyword === '*') {
      enKeyword = 'And';
    } else {
      enKeyword = this.keywordsMap ? this.keywordsMap.get(origKeyword) : origKeyword;
    }
    if (!enKeyword) throw new Error(`Keyword not found: ${origKeyword}`);
    return enKeyword;
  }

  private getDecoratorStep(step: PreparedDecoratorStep, usedPoms: POMS) {
    const { keyword, pickleStep, pomNode } = step;
    const fixtureNames = usedPoms.resolveFixtureNames(pomNode);

    if (fixtureNames.length !== 1) {
      const suggestedTags = fixtureNames.map((name) => buildFixtureTag(name)).join(', ');
      exitWithMessage(
        `Can't guess fixture for decorator step "${pickleStep.text}" in file: ${this.sourceFile}.`,
        `Please set one of the following tags (${suggestedTags}) or refactor your Page Object classes.`,
      );
    }

    return {
      fixtureNames,
      line: this.formatter.step(keyword, pickleStep.text, pickleStep.argument, [fixtureNames[0]]),
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

  private skipByTags(tags: string[]) {
    return this.options.tagsExpression?.evaluate(tags) === false;
  }
}

function isOutline(scenario: Scenario) {
  return scenario.keyword === 'Scenario Outline' || scenario.keyword === 'Scenario Template';
}
