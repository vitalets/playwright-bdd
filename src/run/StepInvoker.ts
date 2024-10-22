/**
 * Class to invoke step in playwright runner.
 */

import { PickleStepArgument } from '@cucumber/messages';
import { getLocationInFile } from '../playwright/getLocationInFile';
import { DataTable } from '../cucumber/DataTable';
import { getBddAutoInjectFixtures } from './bddFixtures/autoInject';
import { StepDefinition } from '../steps/registry';
import { runStepWithLocation } from '../playwright/runStepWithLocation';
import { BddContext } from './bddFixtures/test';
import { StepKeyword } from '../steps/types';
import { formatDuplicateStepsMessage, StepFinder } from '../steps/finder';
import { getStepTextWithKeyword } from '../features/helpers';

export type StepKeywordFixture = ReturnType<typeof createStepInvoker>;

export function createStepInvoker(bddContext: BddContext, _keyword: StepKeyword) {
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

    const stepDefinition = this.findStepDefinition(stepText);
    const stepTextWithKeyword = this.getStepTextWithKeyword(stepText);

    // Get location of step call in generated test file.
    // This call must be exactly here to have correct call stack (before async calls)
    const location = getLocationInFile(this.bddContext.testInfo.file);

    const parameters = await this.getStepParameters(
      stepDefinition,
      stepText,
      argument || undefined,
    );

    const fixturesArg = Object.assign({}, stepFixtures, getBddAutoInjectFixtures(this.bddContext));

    this.bddContext.bddAnnotation?.registerStep(stepDefinition, stepText, location);

    await runStepWithLocation(this.bddContext.test, stepTextWithKeyword, location, () => {
      // Although pw-style does not expect usage of world / this in steps,
      // some projects request it for better migration process from cucumber.
      // Here, for pw-style we pass empty object as world.
      // See: https://github.com/vitalets/playwright-bdd/issues/208
      return stepDefinition.code.call(this.bddContext.world, fixturesArg, ...parameters);
    });
  }

  private findStepDefinition(stepText: string) {
    const [_keyword, keywordType, stepLocation] = this.getStepMeta();
    const stepDefinitions = this.stepFinder.findDefinitions(keywordType, stepText);

    if (stepDefinitions.length === 1) return stepDefinitions[0];

    const stepTextWithKeyword = this.getStepTextWithKeyword(stepText);
    const fullStepLocation = `${this.bddContext.featureUri}:${stepLocation}`;

    if (stepDefinitions.length === 0) {
      // todo: better error?
      const message = `Missing step: ${stepTextWithKeyword}`;
      throw new Error(message);
    }

    const message = formatDuplicateStepsMessage(
      stepDefinitions,
      stepTextWithKeyword,
      fullStepLocation,
    );
    throw new Error(message);
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

  private getStepTextWithKeyword(stepText: string) {
    const [keyword] = this.getStepMeta();
    return getStepTextWithKeyword(keyword, stepText);
  }

  private getStepMeta() {
    const { stepIndex, bddTestMeta } = this.bddContext;
    return bddTestMeta.pickleSteps[stepIndex];
  }
}
