/**
 * Class to invoke step in playwright runner.
 */

import { TestStepInfo } from '@playwright/test';
import { PickleStepArgument } from '@cucumber/messages';
import { getLocationInFile } from '../playwright/getLocationInFile';
import { DataTable } from '../cucumber/DataTable';
import { BddAutoInjectFixtures, getBddAutoInjectFixtures } from './bddTestFixturesAuto';
import { excludeStepAliases, formatDuplicateStepsMessage, StepFinder } from '../steps/finder';
import { MatchedStepDefinition } from '../steps/matchedStepDefinition';
import { BddContext } from './bddContext';
import { BddStepState } from './bddStepState';
import { getStepHooksToRun, runStepHooks } from '../hooks/step';
import { getSpecFileByFeatureFile } from '../generate/paths';

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
  // eslint-disable-next-line max-lines-per-function
  async invoke(
    stepText: string, // step text without keyword
    argument?: PickleStepArgument | null,
    providedFixtures?: Record<string, unknown>,
  ) {
    this.bddContext.stepIndex++;
    const stepState = this.getStepState();
    stepState.initNewStep(stepText, argument?.docString?.mediaType);

    const stepTextWithKeyword = this.getBddStepData().textWithKeyword;
    const matchedDefinition = this.findStepDefinition(stepText, stepTextWithKeyword);

    // Search the generated file because testInfo.file may already point to the mapped feature.
    // This call must be exactly here to have correct call stack (before async calls)
    const location = getStepLocation(this.bddContext);

    const stepParameters = await this.getStepParameters(
      matchedDefinition,
      stepText,
      argument || undefined,
    );

    const stepHookFixtures = this.getStepHookFixtures(providedFixtures || {});
    const stepFixtures = this.getStepFixtures(providedFixtures || {});

    const wrappedStepFn = async (info: TestStepInfo) => {
      stepState.setInfo(info);
      try {
        await this.runBeforeStepHooks(stepHookFixtures);
        if (stepState.skipped) return;
        return await this.runWithAfterStepHooks(stepHookFixtures, () => {
          return matchedDefinition.definition.fn.call(
            // Although pw-style does not expect usage of world / this in steps,
            // some projects request it for better migration process from cucumber.
            // Here, for pw-style we pass empty object as world.
            // See: https://github.com/vitalets/playwright-bdd/issues/208
            this.world,
            stepFixtures,
            ...stepParameters,
          );
        });
      } finally {
        stepState.reset();
      }
    };

    await this.bddContext.test.step(stepTextWithKeyword, wrappedStepFn, { location });
  }

  // eslint-disable-next-line visual/complexity
  private async runWithAfterStepHooks<T>(
    stepHookFixtures: Record<string, unknown> & BddAutoInjectFixtures,
    fn: () => T | Promise<T>,
  ) {
    const stepState = this.getStepState();
    let result: T;

    try {
      result = await fn();
    } catch (e) {
      // Native skip already annotated the step. Suppress only its control-flow error
      // so AfterStep can run and any real cleanup failure takes precedence.
      if (!stepState.isSkipError(e)) {
        stepState.setError(e);
      }
    }

    // run after step hooks even if step was skipped in step body.

    try {
      stepState.isAfterStepPhase = true;
      await this.runAfterStepHooks(stepHookFixtures);
    } catch (e) {
      // Preserve the original body failure when an after-hook also fails.
      if (stepState.error === undefined) stepState.setError(e);
    }

    if (stepState.error !== undefined) throw stepState.error;
    return result!;
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
    let stepDefinitions = this.stepFinder.findDefinitions(
      keywordType,
      stepText,
      this.bddContext.tags,
    );
    stepDefinitions = excludeStepAliases(stepDefinitions);

    const firstDefinition = stepDefinitions[0];
    if (stepDefinitions.length === 1 && firstDefinition) return firstDefinition;

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

  private getStepState() {
    // we make BddStepFixture as public, but store BddStepState
    // in context to have access to internal methods.
    return this.bddContext.step as BddStepState;
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

/**
 * Finds the current BDD step call in the generated spec file and returns its report location.
 * Without source maps, the location points to the generated `.spec.js` file.
 * With source maps, the stack frame is mapped back to the original `.feature` file.
 */
function getStepLocation({ config, featureUri }: BddContext) {
  const generatedFile = getSpecFileByFeatureFile(config, featureUri);
  return getLocationInFile(generatedFile);
}
