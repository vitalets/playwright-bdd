/**
 * Decorator steps are generated differently from regular steps.
 * Because they need to guess correct fixture after all steps are processed (to handle POM classes inheritance).
 * In the first pass, decorator steps are rendered as empty lines (slots).
 * Then fixtures are guessed and slots are filled with decorator steps lines.
 */
import { PickleStep } from '@cucumber/messages';
import { PomNode } from '../steps/decorators/class';
import { TestPoms } from './testPoms';
import { exit } from '../utils/exit';

type DecoratorStepsOptions = {
  featureUri: string;
  testTitle: string;
  testFixtureNames: Set<string>;
  testTags?: string[];
};

type DecoratorStepInfo = {
  index: number;
  keyword: string;
  pickleStep: PickleStep;
  pomNode: PomNode;
  fixtureName: string;
};

export class DecoratorSteps {
  private steps: DecoratorStepInfo[] = [];
  private testPoms: TestPoms;

  constructor(private options: DecoratorStepsOptions) {
    this.testPoms = new TestPoms(options.testTitle);
  }

  push(partialStepInfo: Omit<DecoratorStepInfo, 'fixtureName'>) {
    this.steps.push({ ...partialStepInfo, fixtureName: '' });
  }

  forEach(fn: (step: DecoratorStepInfo) => unknown) {
    this.steps.forEach(fn);
  }

  resolveFixtureNames() {
    this.steps.forEach((step) => this.testPoms.addPom(step.pomNode));
    this.options.testFixtureNames.forEach((fixtureName) =>
      this.testPoms.addPomByFixtureName(fixtureName),
    );
    this.options.testTags?.forEach((tag) => this.testPoms.addPomByTag(tag));
    this.testPoms.resolveFixtures();
    this.steps.forEach((step) => {
      step.fixtureName = this.getFixtureName(step);
    });
  }

  private getFixtureName(decoratorStep: DecoratorStepInfo) {
    const { pomNode, pickleStep } = decoratorStep;
    const resolvedFixtures = this.testPoms.getResolvedFixtures(pomNode);

    if (resolvedFixtures.length !== 1) {
      const possibleFixturesNames = resolvedFixtures.length
        ? ` (${resolvedFixtures.map((f) => f.name).join(', ')})`
        : '';
      exit(
        `Can't guess fixture for decorator step "${pickleStep.text}" in file: ${this.options.featureUri}.`,
        `Possible fixtures: ${resolvedFixtures.length}${possibleFixturesNames}.`,
        `Please refactor your Page Object classes.`,
      );
    }

    return resolvedFixtures[0].name;
  }
}
