/**
 * Decorator steps are generated differently from regular steps.
 * Because they need to guess correct fixture after all steps are processed (to handle POM classes inheritance).
 * In the first pass, decorator steps are rendered as empty lines (slots).
 * Then fixtures are guessed and slots are filled with decorator steps lines.
 */
import { PickleStep } from '@cucumber/messages';
import { TestPoms, UsedFixture } from './testPoms';
import { exit } from '../utils/exit';
import { PomNode } from '../steps/decorators/pomGraph';

type DecoratorStepsOptions = {
  statefulPoms?: boolean;
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
    this.steps.forEach((step) => this.testPoms.registerPomNode(step.pomNode));
    this.options.testFixtureNames.forEach((fixtureName) =>
      this.testPoms.registerPomNodeByFixtureName(fixtureName),
    );
    this.options.testTags?.forEach((tag) => this.testPoms.registerPomNodeByTag(tag));
    this.testPoms.resolveFixtures();
    this.steps.forEach((step) => {
      step.fixtureName = this.getFixtureName(step);
    });
  }

  // eslint-disable-next-line visual/complexity
  private getFixtureName(decoratorStep: DecoratorStepInfo) {
    const { pomNode, pickleStep } = decoratorStep;
    const resolvedFixtures = this.testPoms.getResolvedFixtures(pomNode);

    if (resolvedFixtures.length === 0) {
      return this.exitEmptyFixture(pickleStep);
    }

    if (resolvedFixtures.length > 1) {
      if (this.options.statefulPoms) {
        return this.exitAmbiguousFixture(pickleStep, resolvedFixtures);
      } else {
        // tagged fixture has priority
        const firstTaggedFixture = resolvedFixtures.find((f) => f.byTag);
        const firstFixtureWithName =
          firstTaggedFixture?.name || pomNode.fixtureName || resolvedFixtures[0].name;
        return firstFixtureWithName || this.exitEmptyFixture(pickleStep);
      }
    }

    return resolvedFixtures[0].name;
  }

  private exitEmptyFixture(pickleStep: PickleStep) {
    exit(
      `No fixtures found for decorator step "${pickleStep.text}"`,
      `in "${this.options.testTitle}" (${this.options.featureUri}).`,
      `Please add @Fixture decorator to the class.`,
    );
    // return string to make ts happy
    return '';
  }

  private exitAmbiguousFixture(pickleStep: PickleStep, resolvedFixtures: UsedFixture[]) {
    const possibleFixturesNames = resolvedFixtures.map((f) => f.name).join(', ');
    exit(
      `Several fixtures found for decorator step "${pickleStep.text}"`,
      `in "${this.options.testTitle}" (${this.options.featureUri}).`,
      `Possible fixtures: ${possibleFixturesNames}`,
      `Please refactor your Page Object classes.`,
    );
    // return string to make ts happy
    return '';
  }
}
