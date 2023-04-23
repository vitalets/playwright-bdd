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
} from '@cucumber/messages';
import * as formatter from './formatter';

export class PWFile {
  private lines: string[] = [];

  constructor(public doc: GherkinDocument, private pickles: Pickle[]) {}

  get content() {
    return this.lines.join('\n');
  }

  build() {
    this.lines = [...formatter.fileHeader(this.doc.uri), ...this.getRootSuite()];
    return this;
  }

  private getRootSuite() {
    if (!this.doc.feature) throw new Error(`Document without feature.`);
    return this.getSuite(this.doc.feature);
  }

  private getSuite({ name, children }: Feature | Rule) {
    const lines: string[] = [];
    children.forEach((child) => lines.push(...this.getSuiteChild(child)));
    return formatter.suite(name, lines);
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
    let exampleIndex = 0;
    scenario.examples.forEach((example) => {
      example.tableBody.forEach((exampleRow) => {
        const title = `Example #${++exampleIndex}`;
        const { keywords, lines } = this.getSteps(scenario, exampleRow.id);
        const testLines = formatter.test(title, keywords, lines);
        suiteLines.push(...testLines);
      });
    });
    return formatter.suite(scenario.name, suiteLines);
  }

  private getTest(scenario: Scenario) {
    const { keywords, lines } = this.getSteps(scenario);
    return formatter.test(scenario.name, keywords, lines);
  }

  private getSteps(scenario: Scenario | Background, outlineExampleRowId?: string) {
    const keywords = new Set<string>();
    const lines = scenario.steps.map((step) => {
      const pickleStep = this.getPickleStep(step, outlineExampleRowId);
      const { keyword, line } = this.getStep(step, pickleStep);
      keywords.add(keyword);
      return line;
    });
    return { keywords, lines };
  }

  private getStep(step: Step, { text, argument }: PickleStep) {
    let keyword = step.keyword.trim();
    if (keyword === '*') keyword = 'And';
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
}

function isOutline(scenario: Scenario) {
  return scenario.keyword === 'Scenario Outline';
}
