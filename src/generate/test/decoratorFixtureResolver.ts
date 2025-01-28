/**
 * Resolves fixture names for decorator steps.
 */
import { TestPoms, UsedFixtureInfo } from './poms';
import { exit } from '../../utils/exit';
import { PomNode } from '../../steps/decorators/pomGraph';
import { StepData } from '.';
import { BDDConfig } from '../../config/types';

export class DecoratorFixtureResolver {
  private testPoms = new TestPoms();

  constructor(
    private config: BDDConfig,
    testTags: string[],
  ) {
    testTags.forEach((tag) => this.testPoms.registerPomNodeByTag(tag));
  }

  resolveFixtureNames(stepsData: Map<string, StepData>) {
    stepsData.forEach(({ fixtureNames, pomNode }) => {
      fixtureNames.forEach((fixtureName) => {
        this.testPoms.registerPomNodeByFixtureName(fixtureName);
      });
      if (pomNode) {
        this.testPoms.registerPomNode(pomNode);
      }
    });
    this.testPoms.resolveAllFixtures();
    stepsData.forEach((stepData) => {
      if (stepData.pomNode) {
        stepData.pomFixtureName = this.getFixtureName(stepData.pomNode, stepData);
        stepData.fixtureNames.push(stepData.pomFixtureName);
      }
    });
  }

  // eslint-disable-next-line visual/complexity
  private getFixtureName(pomNode: PomNode, stepData: StepData) {
    const resolvedFixtures = this.testPoms.getResolvedFixtures(pomNode);

    const firstFixture = resolvedFixtures[0];

    if (resolvedFixtures.length > 1) {
      if (this.config.statefulPoms) {
        return exitAmbiguousDecoratorFixture(stepData, resolvedFixtures);
      } else {
        // tagged fixture has priority
        const firstTaggedFixture = resolvedFixtures.find((f) => f.byTag);
        const firstFixtureWithName =
          firstTaggedFixture?.name || pomNode.fixtureName || firstFixture?.name;
        return firstFixtureWithName || exitEmptyDecoratorFixture(stepData);
      }
    }

    if (!firstFixture) {
      return exitEmptyDecoratorFixture(stepData);
    }

    return firstFixture.name;
  }
}

function exitEmptyDecoratorFixture({ pickleStep, location }: StepData) {
  return exit(
    `No POM fixtures found for decorator step "${pickleStep.text}" at ${location}.`,
    `Please add @Fixture decorator to the class.`,
  );
}

function exitAmbiguousDecoratorFixture(
  { pickleStep, location }: StepData,
  resolvedFixtures: UsedFixtureInfo[],
) {
  const possibleFixturesNames = resolvedFixtures.map((f) => f.name).join(', ');
  return exit(
    `Multiple POM fixtures found for decorator step "${pickleStep.text}" at ${location}.`,
    `Possible fixtures: ${possibleFixturesNames}.`,
    `Please refactor your Page Object classes.`,
  );
}
