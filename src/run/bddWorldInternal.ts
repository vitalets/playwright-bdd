/**
 * BddWorld sub-property for internal usage.
 */
import { randomUUID } from 'node:crypto';
import * as messages from '@cucumber/messages';
import { Fixtures, TestTypeCommon } from '../playwright/types';
import { BddWorld } from './bddWorld';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { Group } from '@cucumber/cucumber-expressions';

export class BddWorldInternal {
  currentStepFixtures: Fixtures<TestTypeCommon> = {};
  private pickle: messages.Pickle;
  private testCase: messages.TestCase;

  constructor(private world: BddWorld) {
    this.pickle = this.createPickle();
    this.testCase = this.createTestCase();
  }

  registerStep(stepDefinition: StepDefinition, pickleStep: messages.PickleStep) {
    (this.pickle.steps as messages.PickleStep[]).push(pickleStep);
    (this.testCase.testSteps as messages.TestStep[]).push(
      this.createTestCaseStep(stepDefinition, pickleStep),
    );
  }

  /**
   * Attach pickle and testCase to testInfo for reporting.
   */
  async attachBddData() {
    await this.world.testInfo.attach('__bddData', {
      body: JSON.stringify({ pickle: this.pickle, testCase: this.testCase }),
    });
  }

  /**
   * Create Pickle for reporting.
   */
  private createPickle(): messages.Pickle {
    return {
      id: this.world.testInfo.testId,
      uri: '',
      name: this.world.testInfo.title,
      language: this.world.options.lang,
      steps: [],
      tags: this.world.tags.map((tag) => ({ name: tag, astNodeId: '' })),
      astNodeIds: [],
    };
  }

  /**
   * Create TestCase for reporting.
   */
  private createTestCase(): messages.TestCase {
    return {
      id: this.world.testInfo.testId,
      pickleId: this.pickle.id,
      testSteps: [],
    };
  }

  /**
   * Create TestCaseStep.
   * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/assemble_test_cases.ts#L93
   */
  private createTestCaseStep(
    stepDefinition: StepDefinition,
    pickleStep: messages.PickleStep,
  ): messages.TestStep {
    const result = stepDefinition.expression.match(pickleStep.text);
    if (!result) {
      // this should not happen as stepDefinition is already matched
      throw Error(`Empty result`);
    }
    const stepMatchArguments = result.map((arg) => {
      return {
        group: mapArgumentGroup(arg.group),
        parameterTypeName: arg.parameterType.name,
      };
    });

    return {
      id: randomUUID(),
      pickleStepId: pickleStep.id,
      stepDefinitionIds: [stepDefinition.id],
      stepMatchArgumentsLists: [{ stepMatchArguments }],
    };
  }
}

function mapArgumentGroup(group: Group): messages.Group {
  return {
    start: group.start,
    value: group.value,
    children: group.children?.map((child) => mapArgumentGroup(child)),
  };
}
