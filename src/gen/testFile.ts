/**
 * Generate test code.
 */

/* eslint-disable max-lines */

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
import * as formatter from './formatter';
import { KeywordsMap, getKeywordsMap } from './i18n';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { findStepDefinition } from '../cucumber/loadSteps';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { CucumberStepFunction, getFixtureNames } from '../run/createBdd';
import { TestTypeCommon } from '../playwright/types';
import { isParentChildTest } from '../playwright/testTypeImpl';
import { TEST_KEY_SEPARATOR, TestFileTags, getFormatterFlags } from './tags';
import { BDDConfig } from '../config';
import { KeywordType, getStepKeywordType } from '@cucumber/cucumber/lib/formatter/helpers/index';

type TestFileOptions = {
  doc: GherkinDocument;
  pickles: Pickle[];
  supportCodeLibrary: ISupportCodeLibrary;
  config: BDDConfig;
};

export type UndefinedStep = {
  keywordType: KeywordType;
  step: Step;
  pickleStep: PickleStep;
};

export class TestFile {
  private lines: string[] = [];
  private keywordsMap?: KeywordsMap;
  private _outputPath?: string;
  private testFileTags = new TestFileTags();
  public customTest?: TestTypeCommon;
  public undefinedSteps: UndefinedStep[] = [];

  constructor(private options: TestFileOptions) {}

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
    if (!this._outputPath) {
      const relativeSourceFile = path.isAbsolute(this.sourceFile)
        ? path.relative(process.cwd(), this.sourceFile)
        : this.sourceFile;

      // remove ".." to keep all generated files in outputDir
      const finalPath = relativeSourceFile
        .split(path.sep)
        .filter((part) => part !== '..')
        .join(path.sep);

      this._outputPath = path.join(this.config.outputDir, `${finalPath}.spec.js`);
    }

    return this._outputPath;
  }

  build() {
    this.loadI18nKeywords();
    this.lines = [
      ...this.getFileHeader(), // prettier-ignore
      ...this.getRootSuite(),
      ...this.getTagsFixture(),
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
    return formatter.fileHeader(this.sourceFile, importTestFrom);
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

  private getTagsFixture() {
    return formatter.tagsFixture(this.testFileTags.tagsMap, TEST_KEY_SEPARATOR);
  }

  private getRootSuite() {
    const { feature } = this.options.doc;
    if (!feature) throw new Error(`Document without feature.`);
    return this.getSuite(feature);
  }

  /**
   * Generate test.describe suite for root Feature or Rule
   */
  private getSuite(feature: Feature | Rule, parents: (Feature | Rule)[] = []) {
    const flags = getFormatterFlags(feature);
    const lines: string[] = [];
    const newParents = [...parents, feature];
    feature.children.forEach((child) => lines.push(...this.getSuiteChild(child, newParents)));
    return formatter.suite(feature.name, lines, flags);
  }

  private getSuiteChild(child: FeatureChild | RuleChild, parents: (Feature | Rule)[]) {
    if ('rule' in child && child.rule) return this.getSuite(child.rule, parents);
    if (child.background) return this.getBeforeEach(child.background);
    if (child.scenario) return this.getScenarioLines(child.scenario, parents);
    throw new Error(`Empty child: ${JSON.stringify(child)}`);
  }

  private getScenarioLines(scenario: Scenario, parents: (Feature | Rule)[]) {
    return isOutline(scenario)
      ? this.getOutlineSuite(scenario, parents)
      : this.getTest(scenario, parents);
  }

  /**
   * Generate test.beforeEach for Background
   */
  private getBeforeEach(bg: Background) {
    const { fixtures, lines } = this.getSteps(bg);
    return formatter.beforeEach(fixtures, lines);
  }

  /**
   * Generate test.describe suite for Scenario Outline
   */
  private getOutlineSuite(scenario: Scenario, parents: (Feature | Rule)[]) {
    const lines: string[] = [];
    const flags = getFormatterFlags(scenario);
    const newParents = [...parents, scenario];
    let exampleIndex = 0;
    scenario.examples.forEach((examples) => {
      examples.tableBody.forEach((exampleRow) => {
        lines.push(
          ...this.getOutlineTest(
            // prettier-ignore
            scenario,
            examples,
            exampleRow,
            ++exampleIndex,
            newParents,
          ),
        );
      });
    });
    return formatter.suite(scenario.name, lines, flags);
  }

  /**
   * Generate test from Examples row
   */
  // eslint-disable-next-line max-params
  private getOutlineTest(
    scenario: Scenario,
    examples: Examples,
    exampleRow: TableRow,
    exampleIndex: number,
    parents: (Feature | Rule | Scenario)[],
  ) {
    const flags = getFormatterFlags(examples);
    const title = `Example #${exampleIndex}`;
    this.testFileTags.registerTestTags(parents, title, examples.tags);
    const { fixtures, lines } = this.getSteps(scenario, exampleRow.id);
    return formatter.test(title, fixtures, lines, flags);
  }

  /**
   * Generate test from Scenario
   */
  private getTest(scenario: Scenario, parents: (Feature | Rule)[]) {
    this.testFileTags.registerTestTags(parents, scenario.name, scenario.tags);
    const flags = getFormatterFlags(scenario);
    const { fixtures, lines } = this.getSteps(scenario);
    return formatter.test(scenario.name, fixtures, lines, flags);
  }

  /**
   * Generate test steps
   */
  private getSteps(scenario: Scenario | Background, outlineExampleRowId?: string) {
    const fixtures = new Set<string>();
    let previousKeywordType: KeywordType | undefined = undefined;

    const lines = scenario.steps.map((step) => {
      // todo: move to getStep and check eslint for getSteps()
      const pickleStep = this.getPickleStep(step, outlineExampleRowId);
      const stepDefinition = findStepDefinition(
        this.options.supportCodeLibrary,
        pickleStep.text,
        this.sourceFile,
      );

      const keywordType = (previousKeywordType = getStepKeywordType({
        keyword: step.keyword,
        language: this.language,
        previousKeywordType,
      }));

      if (!stepDefinition) {
        this.undefinedSteps.push({
          keywordType,
          step,
          pickleStep,
        });
      }

      const {
        keyword,
        fixtures: stepFixtures,
        line,
      } = this.getStep(step, pickleStep, stepDefinition);
      fixtures.add(keyword);
      stepFixtures.forEach((fixture) => fixtures.add(fixture));

      return line;
    });

    return { fixtures, lines };
  }

  /**
   * Generate step for Given, When, Then
   */
  private getStep(step: Step, pickleStep: PickleStep, stepDefinition?: StepDefinition) {
    const keyword = this.getKeyword(step);
    const code = stepDefinition?.code as CucumberStepFunction | undefined;
    const fixtureNames = code ? getFixtureNames(code) : ['/* Undefined step! */'];
    if (code) this.updateCustomTest(code);
    const line = formatter.step(keyword, pickleStep.text, pickleStep.argument, fixtureNames);
    return { keyword, fixtures: fixtureNames, line };
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

  private getKeyword(step: Step) {
    const origKeyword = step.keyword.trim();
    if (origKeyword === '*') return 'And';
    if (!this.keywordsMap) return origKeyword;
    const enKeyword = this.keywordsMap.get(origKeyword);
    if (!enKeyword) throw new Error(`Keyword not found: ${origKeyword}`);
    return enKeyword;
  }

  private updateCustomTest(code: CucumberStepFunction) {
    const { customTest } = code;
    if (!customTest || customTest === this.customTest) return;
    if (!this.customTest || isParentChildTest(this.customTest, customTest)) {
      this.customTest = customTest;
    }
    // todo: customTests are mix of different fixtures -> error?
  }
}

function isOutline(scenario: Scenario) {
  return scenario.keyword === 'Scenario Outline' || scenario.keyword === 'Scenario Template';
}
