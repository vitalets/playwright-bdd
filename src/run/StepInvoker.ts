/**
 * Class to invoke steps in generated files.
 */

import { BddWorld } from './bddWorld';
import { ITestCaseHookParameter } from '@cucumber/cucumber';
import { PickleStep } from '@cucumber/messages';
import { findStepDefinition } from '../cucumber/loadSteps';
import { getLocationInFile } from '../playwright/getLocationInFile';
import { runStepWithCustomLocation } from '../playwright/testTypeImpl';
import { Fixtures, TestTypeCommon } from '../playwright/types';
import { getStepCode } from '../stepDefinitions/defineStep';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';

type StepKeyword = 'Given' | 'When' | 'Then' | 'And' | 'But';

export class StepInvoker {
  private text = '';
  private argument?: unknown;

  constructor(
    private world: BddWorld,
    private keyword: StepKeyword,
  ) {
    this.invoke = this.invoke.bind(this);
  }

  async invoke(text: string, argument?: unknown, stepFixtures?: Fixtures<TestTypeCommon>) {
    this.text = text;
    this.argument = argument;
    const { world } = this;

    world.stepFixtures = stepFixtures || {};
    const stepDefinition = this.getStepDefinition();

    // Get location of step call in generated test file.
    // This call must be exactly here to have correct call stack (before async calls)
    const location = getLocationInFile(world.test.info().file);

    const stepTitle = this.getStepTitle();
    const code = getStepCode(stepDefinition);
    const parameters = await this.getStepParameters(stepDefinition);

    return runStepWithCustomLocation(world.test, stepTitle, location, () =>
      code.apply(world, parameters),
    );
  }

  private getStepDefinition() {
    const stepDefinition = findStepDefinition(
      this.world.options.supportCodeLibrary,
      this.text,
      this.world.testInfo.file,
    );

    if (!stepDefinition) {
      throw new Error(`Undefined step: "${this.text}"`);
    }

    return stepDefinition;
  }

  private async getStepParameters(stepDefinition: StepDefinition) {
    const { text, argument, world } = this;
    const { parameters } = await stepDefinition.getInvocationParameters({
      hookParameter: {} as ITestCaseHookParameter,
      step: { text, argument } as PickleStep,
      world,
    });

    return parameters;
  }

  private getStepTitle() {
    // return this.world.options.$bddWorldFixtures.lang === 'en'
    //   ? `${this.keyword} ${this.text}`
    //   : this.text;
    return `${this.text}`;
  }
}
