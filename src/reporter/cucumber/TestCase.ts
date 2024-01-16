/**
 * Builds particular cucumber testCase.
 */
import * as messages from '@cucumber/messages';
import { GherkinDocumentWithPickles } from '../../cucumber/loadFeatures';
import { TestCaseRun } from './TestCaseRun';
import { stringifyLocation } from '../../utils';

export class TestCaseBuilder {
  constructor(
    private testCaseRun: TestCaseRun,
    private docs: GherkinDocumentWithPickles[],
  ) {}

  get id() {
    return this.testCaseRun.test.id;
  }

  build(): messages.TestCase {
    const pickle = this.getPickle();
    const testSteps: messages.TestStep[] = pickle.steps.map((pickleStep, stepIndex) => {
      return this.buildTestStep(pickleStep, stepIndex);
    });
    return {
      id: this.id,
      pickleId: pickle.id,
      testSteps,
    };
  }

  private buildTestStep(pickleStep: messages.PickleStep, stepIndex: number) {
    // find bddDataStep in bddData just by index
    const bddDataStep = this.testCaseRun.bddData.steps[stepIndex];
    return {
      id: `${this.id}-step-${stepIndex}`,
      pickleStepId: pickleStep.id,
      stepDefinitionIds: [],
      stepMatchArgumentsLists: bddDataStep.stepMatchArgumentsLists,
    };
  }

  private getPickle() {
    const { uri, pickleLocation } = this.testCaseRun.bddData;
    const doc = this.docs.find((doc) => doc.uri === uri);
    if (!doc) throw new Error('doc not found');
    const pickle = doc.pickles.find((pickle) => {
      return stringifyLocation(pickle.location) === pickleLocation;
    });
    if (!pickle) throw new Error('pickle not found');
    return pickle;
  }
}
