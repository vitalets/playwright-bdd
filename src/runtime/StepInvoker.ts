/**
 * Class to invoke step in playwright runner.
 */

import { PickleStepArgument } from '@cucumber/messages';
import { getLocationInFile } from '../playwright/getLocationInFile';
import { DataTable } from '../cucumber/DataTable';
import { getBddAutoInjectFixtures } from './bddTestFixturesAuto';
import { runStepWithLocation } from '../playwright/runStepWithLocation';
import { BddContext } from './bddTestFixtures';
import { formatDuplicateStepsMessage, StepFinder } from '../steps/finder';
import { getStepTextWithKeyword } from '../features/helpers';
import { MatchedStepDefinition } from '../steps/matchedStepDefinition';

export type StepKeywordFixture = ReturnType<typeof createStepInvoker>;

export function createStepInvoker(bddContext: BddContext) {
  const invoker = new StepInvoker(bddContext);
  return invoker.invoke.bind(invoker);
}

class StepInvoker {
  private stepFinder: StepFinder;
  constructor(private bddContext: BddContext) {
    this.stepFinder = new StepFinder(bddContext.config);
  }

  /**
   * Invokes particular step.
   * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/test_case_runner.ts#L299
   */
  async invoke(
    stepText: string, // step text without keyword
    argument?: PickleStepArgument | null,
    stepFixtures?: Record<string, unknown>,
  ) {
    this.bddContext.stepIndex++;
    this.bddContext.step.title = stepText;

    const matchedDefinition = this.findStepDefinition(stepText);
    const stepTextWithKeyword = this.getStepTextWithKeyword(stepText);

    // Get location of step call in generated test file.
    // This call must be exactly here to have correct call stack (before async calls)
    const location = getLocationInFile(this.bddContext.testInfo.file);

    const stepParameters = await this.getStepParameters(
      matchedDefinition,
      stepText,
      argument || undefined,
    );

    const fixturesArg = this.getStepFixtures(stepFixtures || {});

    await runStepWithLocation(this.bddContext.test, stepTextWithKeyword, location, () => {
      // Although pw-style does not expect usage of world / this in steps,
      // some projects request it for better migration process from cucumber.
      // Here, for pw-style we pass empty object as world.
      // See: https://github.com/vitalets/playwright-bdd/issues/208
      return matchedDefinition.definition.fn.call(
        this.bddContext.world,
        fixturesArg,
        ...stepParameters,
      );
    });
  }

  private findStepDefinition(stepText: string) {
    const { keywordType, gherkinStepLine } = this.getBddStepData();
    const stepDefinitions = this.stepFinder.findDefinitions(
      keywordType,
      stepText,
      this.bddContext.tags,
    );

    if (stepDefinitions.length === 1) return stepDefinitions[0];

    const stepTextWithKeyword = this.getStepTextWithKeyword(stepText);
    const fullStepLocation = `${this.bddContext.featureUri}:${gherkinStepLine}`;

    if (stepDefinitions.length === 0) {
      // todo: better error?
      throw new Error(`Missing step: ${stepTextWithKeyword}`);
    }

    const message = formatDuplicateStepsMessage(
      stepDefinitions,
      stepTextWithKeyword,
      fullStepLocation,
    );
    throw new Error(message);
  }

  private async getStepParameters(
    matchedDefinition: MatchedStepDefinition,
    world: unknown,
    argument?: PickleStepArgument,
  ) {
    const parameters = await matchedDefinition.getMatchedParameters(world);

    if (argument?.dataTable) {
      parameters.push(new DataTable(argument.dataTable));
    } else if (argument?.docString) {
      parameters.push(argument.docString.content);
    }

    // todo: handle invalid code length
    // see: https://github.com/cucumber/cucumber-js/blob/main/src/models/step_definition.ts#L25

    return parameters;
  }

  private getStepFixtures(providedFixtures: Record<string, unknown>) {
    const { pomFixtureName } = this.getBddStepData();
    if (pomFixtureName) {
      // for decorator steps keep only one fixture - POM instance.
      const pomFixture = providedFixtures[pomFixtureName];
      if (!pomFixture) throw new Error(`POM fixture not provided: ${pomFixtureName}`);
      providedFixtures = { [pomFixtureName]: pomFixture };
    }

    return Object.assign({}, providedFixtures, getBddAutoInjectFixtures(this.bddContext));
  }

  private getStepTextWithKeyword(stepText: string) {
    const { keywordOrig } = this.getBddStepData();
    return getStepTextWithKeyword(keywordOrig, stepText);
  }

  private getBddStepData() {
    const { stepIndex, bddTestData } = this.bddContext;
    const bddStepData = bddTestData.steps[stepIndex];
    if (!bddStepData) {
      throw new Error(
        [
          `bddStepData not found for step index: ${stepIndex}.`,
          `Steps: ${JSON.stringify(bddTestData.steps)}`,
        ].join(' '),
      );
    }
    return bddStepData;
  }
}
