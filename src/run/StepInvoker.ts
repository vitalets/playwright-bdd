/**
 * Class to invoke step in playwright runner.
 */

import { BddWorld } from './bddWorld';
import { ITestCaseHookParameter } from '@cucumber/cucumber';
import { PickleStep, PickleStepArgument } from '@cucumber/messages';
import { findStepDefinition } from '../cucumber/findStep';
import { getLocationInFile } from '../playwright/getLocationInFile';
import { runStepWithCustomLocation } from '../playwright/testTypeImpl';
import { Fixtures, TestTypeCommon } from '../playwright/types';
import { getStepCode } from '../steps/playwrightStyle/defineStep';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { isEnglish } from '../config/lang';

type StepKeyword = 'Given' | 'When' | 'Then' | 'And' | 'But';

export class StepInvoker {
  constructor(
    private world: BddWorld,
    private keyword: StepKeyword,
  ) {
    this.invoke = this.invoke.bind(this);
  }

  /**
   * Invokes particular step.
   * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/test_case_runner.ts#L299
   */
  async invoke(
    stepText: string,
    argument?: PickleStepArgument | null,
    stepFixtures?: Fixtures<TestTypeCommon>,
  ) {
    this.world.$internal.currentStepFixtures = stepFixtures || {};
    const stepDefinition = this.getStepDefinition(stepText);

    // Get location of step call in generated test file.
    // This call must be exactly here to have correct call stack (before async calls)
    const location = getLocationInFile(this.world.testInfo.file);

    const stepTitle = this.getStepTitle(stepText);
    const code = getStepCode(stepDefinition);
    const parameters = await this.getStepParameters(
      stepDefinition,
      stepText,
      argument || undefined,
    );

    this.world.$internal.bddDataManager?.registerStep(stepDefinition, stepText, location);
    this.world.step.title = stepText;

    await runStepWithCustomLocation(this.world.test, stepTitle, location, () =>
      code.apply(this.world, parameters),
    );
  }

  private getStepDefinition(text: string) {
    const stepDefinition = findStepDefinition(
      this.world.options.supportCodeLibrary,
      text,
      this.world.testInfo.file,
    );

    if (!stepDefinition) {
      throw new Error(`Undefined step: "${text}"`);
    }

    return stepDefinition;
  }

  private async getStepParameters(
    stepDefinition: StepDefinition,
    text: string,
    argument?: PickleStepArgument,
  ) {
    // see: https://github.com/cucumber/cucumber-js/blob/main/src/models/step_definition.ts#L25
    const { parameters } = await stepDefinition.getInvocationParameters({
      hookParameter: {} as ITestCaseHookParameter,
      // only text and argument are needed
      step: { text, argument } as PickleStep,
      world: this.world,
    });

    return parameters;
  }

  private getStepTitle(text: string) {
    // Currently prepend keyword only for English.
    // For other langs it's more complex as we need to pass original keyword from step.
    return isEnglish(this.world.options.lang) ? `${this.keyword} ${text}` : text;
  }
}
