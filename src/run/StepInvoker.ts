/**
 * Class to invoke step in playwright runner.
 */

import { PickleStepArgument } from '@cucumber/messages';
import { getLocationInFile } from '../playwright/getLocationInFile';
import { DataTable } from '../cucumber/DataTable';
import { getBddAutoInjectFixtures } from './bddFixtures/autoInject';
import { StepDefinition, findStepDefinition } from '../steps/registry';
import { runStepWithLocation } from '../playwright/runStepWithLocation';
import { BddContext } from './bddFixtures/test';
import { StepKeyword } from '../steps/types';

export type StepKeywordFixture = ReturnType<typeof createStepInvoker>;

export function createStepInvoker(bddContext: BddContext, _keyword: StepKeyword) {
  const invoker = new StepInvoker(bddContext);
  return invoker.invoke.bind(invoker);
}

class StepInvoker {
  constructor(
    private bddContext: BddContext,
    // keyword in not needed now, b/c we can get all info about step from test meta
    // private keyword: StepKeyword,
  ) {}

  /**
   * Invokes particular step.
   * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/test_case_runner.ts#L299
   */
  async invoke(
    stepText: string, // step text without keyword
    argument?: PickleStepArgument | null,
    stepFixtures?: Record<string, unknown>,
  ) {
    const stepDefinition = this.getStepDefinition(stepText);

    // Get location of step call in generated test file.
    // This call must be exactly here to have correct call stack (before async calls)
    const location = getLocationInFile(this.bddContext.testInfo.file);

    const { titleWithKeyword } = this.updateCurrentStepInfo(stepText);
    const parameters = await this.getStepParameters(
      stepDefinition,
      stepText,
      argument || undefined,
    );

    const fixturesArg = Object.assign({}, stepFixtures, getBddAutoInjectFixtures(this.bddContext));

    this.bddContext.bddAnnotation?.registerStep(stepDefinition, stepText, location);

    await runStepWithLocation(this.bddContext.test, titleWithKeyword, location, () => {
      // Although pw-style does not expect usage of world / this in steps,
      // some projects request it for better migration process from cucumber.
      // Here, for pw-style we pass empty object as world.
      // See: https://github.com/vitalets/playwright-bdd/issues/208
      return stepDefinition.code.call(this.bddContext.world, fixturesArg, ...parameters);
    });
  }

  private getStepDefinition(text: string) {
    const stepDefinition = findStepDefinition(
      text,
      // todo: change to feature uri
      this.bddContext.testInfo.file,
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
    const parameters = await Promise.all(
      // todo: pass World arg.getValue instead of null
      // todo: optimize to re-use matches from finding step definitions
      stepDefinition.expression.match(text)!.map((arg) => arg.getValue(null)),
    );
    if (argument?.dataTable) {
      parameters.push(new DataTable(argument.dataTable));
    } else if (argument?.docString) {
      parameters.push(argument.docString.content);
    }

    // todo: handle invalid code length
    // see: https://github.com/cucumber/cucumber-js/blob/main/src/models/step_definition.ts#L25

    return parameters;
  }

  private updateCurrentStepInfo(stepText: string) {
    const { step, bddTestMeta } = this.bddContext;
    step.indexInPickle++;
    step.title = stepText;
    step.titleWithKeyword = bddTestMeta.pickleSteps[step.indexInPickle];
    if (!step.titleWithKeyword) {
      // should not happen
      throw new Error(
        [
          `Step title not found for index ${step.indexInPickle}`,
          `in pickle steps: ${bddTestMeta.pickleSteps}`,
        ].join(' '),
      );
    }
    return step;
  }
}
