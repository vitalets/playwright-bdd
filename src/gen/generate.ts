/**
 * Generate test code.
 */
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
} from '@cucumber/messages';
import * as formatter from './formatter';
import { KeywordsMap, getKeywordsMap } from './i18n';

export class PWFile {
  private lines: string[] = [];
  private keywordsMap?: KeywordsMap;

  constructor(public doc: GherkinDocument, private pickles: Pickle[]) {}

  get content() {
    return this.lines.join('\n');
  }

  get language() {
    return this.doc.feature?.language || 'en';
  }

  build() {
    this.loadI18nKeywords();
    this.lines = [...formatter.fileHeader(this.doc.uri), ...this.getRootSuite()];
    return this;
  }

  private loadI18nKeywords() {
    if (this.language !== 'en') {
      this.keywordsMap = getKeywordsMap(this.language);
    }
  }

  private getRootSuite() {
    if (!this.doc.feature) throw new Error(`Document without feature.`);
    return this.getSuite(this.doc.feature);
  }

  private getSuite(feature: Feature | Rule) {
    const tags = getTagNames(feature);
    const lines: string[] = [];
    feature.children.forEach((child) => lines.push(...this.getSuiteChild(child)));
    return formatter.suite(tags, feature.name, lines);
  }

  private getSuiteChild(child: FeatureChild | RuleChild) {
    if ('rule' in child && child.rule) return this.getSuite(child.rule);
    const { background, scenario } = child;
    if (background) return this.getBeforeEach(background);
    if (scenario) return this.getScenarioLines(scenario);
    throw new Error(`Empty child: ${JSON.stringify(child)}`);
  }

  private getScenarioLines(scenario: Scenario) {
    return isOutline(scenario) ? this.getOutlineSuite(scenario) : this.getTest(scenario);
  }

  private getBeforeEach(bg: Background) {
    const { keywords, lines } = this.getSteps(bg);
    return formatter.beforeEach(keywords, lines);
  }

  private getOutlineSuite(scenario: Scenario) {
    const suiteLines: string[] = [];
    const suiteTags = getTagNames(scenario);
    let exampleIndex = 0;
    scenario.examples.forEach((example) => {
      const tags = getTagNames(example);
      example.tableBody.forEach((exampleRow) => {
        const title = `Example #${++exampleIndex}`;
        const { keywords, lines } = this.getSteps(scenario, exampleRow.id);
        const testLines = formatter.test(tags, title, keywords, lines);
        suiteLines.push(...testLines);
      });
    });
    return formatter.suite(suiteTags, scenario.name, suiteLines);
  }

  private getTest(scenario: Scenario) {
    const tags = getTagNames(scenario);
    const { keywords, lines } = this.getSteps(scenario);
    return formatter.test(tags, scenario.name, keywords, lines);
  }

  private getSteps(scenario: Scenario | Background, outlineExampleRowId?: string) {
    const keywords = new Set<string>();
    const lines = scenario.steps.map((step) => {
      const pickleStep = this.getPickleStep(step, outlineExampleRowId);
      // todo: findStepDefinition, get fixtures by step definition
      const { keyword, line } = this.getStep(step, pickleStep);
      keywords.add(keyword);
      return line;
    });
    return { keywords, lines };
  }

  private getStep(step: Step, { text, argument }: PickleStep) {
    const keyword = this.getKeyword(step);
    const line = formatter.step(keyword, text, argument);
    return { keyword, line };
  }

  private getPickleStep(step: Step, outlineExampleRowId?: string) {
    for (const pickle of this.pickles) {
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
}

function getTagNames(item: Feature | Rule | Scenario | Examples) {
  return item.tags.map((tag) => tag.name);
}

function isOutline(scenario: Scenario) {
  return scenario.keyword === 'Scenario Outline' || scenario.keyword === 'Scenario Template';
}
