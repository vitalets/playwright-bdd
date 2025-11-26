/**
 * Class to invoke step in playwright runner.
 */

import { PickleStepArgument } from '@cucumber/messages';
import { getLocationInFile } from '../playwright/getLocationInFile';
import { DataTable } from '../cucumber/DataTable';
import { BddAutoInjectFixtures, getBddAutoInjectFixtures } from './bddTestFixturesAuto';
import { runStepWithLocation } from '../playwright/runStepWithLocation';
import { formatDuplicateStepsMessage, StepFinder } from '../steps/finder';
import { MatchedStepDefinition } from '../steps/matchedStepDefinition';
import { BddContext } from './bddContext';
import { getStepHooksToRun, runStepHooks } from '../hooks/step';

export type BddStepFn = BddStepInvoker['invoke'];

export class BddStepInvoker {
  private stepFinder: StepFinder;
  constructor(
    private bddContext: BddContext,
    private world: unknown,
  ) {
    this.stepFinder = new StepFinder(bddContext.config);
  }

  /**
   * Invokes particular step.
   */
  async invoke(
    stepText: string, // step text without keyword
    argument?: PickleStepArgument | null,
    providedFixtures?: Record<string, unknown>,
  ) {
    this.bddContext.stepIndex++;
    this.bddContext.step.title = stepText;

    const stepTextWithKeyword = this.getBddStepData().textWithKeyword;
    const matchedDefinition = this.findStepDefinition(stepText, stepTextWithKeyword);

    // Get location of step call in generated test file.
    // This call must be exactly here to have correct call stack (before async calls)
    const location = getLocationInFile(this.bddContext.testInfo.file);

    const stepParameters = await this.getStepParameters(
      matchedDefinition,
      stepText,
      argument || undefined,
    );

    const stepHookFixtures = this.getStepHookFixtures(providedFixtures || {});
    const stepFixtures = this.getStepFixtures(providedFixtures || {});

    await runStepWithLocation(this.bddContext.test, stepTextWithKeyword, location, async () => {
      // Although pw-style does not expect usage of world / this in steps,
      // some projects request it for better migration process from cucumber.
      // Here, for pw-style we pass empty object as world.
      // See: https://github.com/vitalets/playwright-bdd/issues/208
      await this.runBeforeStepHooks(stepHookFixtures);
      const result = await matchedDefinition.definition.fn.call(
        this.world,
        stepFixtures,
        ...stepParameters,
      );
      await this.runAfterStepHooks(stepHookFixtures);
      return result;
    });
  }

  private async runBeforeStepHooks(
    stepHookFixtures: Record<string, unknown> & BddAutoInjectFixtures,
  ) {
    const beforeHooksToRun = getStepHooksToRun('beforeStep', this.bddContext.tags);
    await runStepHooks(beforeHooksToRun, this.world, stepHookFixtures);
  }

  private async runAfterStepHooks(
    stepHookFixtures: Record<string, unknown> & BddAutoInjectFixtures,
  ) {
    const afterHooksToRun = getStepHooksToRun('afterStep', this.bddContext.tags);
    afterHooksToRun.reverse();
    await runStepHooks(afterHooksToRun, this.world, stepHookFixtures);
  }

  private findStepDefinition(stepText: string, stepTextWithKeyword: string) {
    const { keywordType, gherkinStepLine } = this.getBddStepData();
    const stepDefinitions = this.stepFinder.findDefinitions(
      keywordType,
      stepText,
      this.bddContext.tags,
    );

    const firstFoundDefinition = stepDefinitions[0];
    if (firstFoundDefinition && stepDefinitions.length === 1) return firstFoundDefinition;

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

  private getStepHookFixtures(providedFixtures: Record<string, unknown>) {
    return Object.assign({}, providedFixtures, getBddAutoInjectFixtures(this.bddContext));
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
