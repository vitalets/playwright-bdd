/**
 * Builds particular cucumber testCase.
 *
 * About hooks:
 * There are many fixtures that wrap each test, they are actually hooks.
 * How to decide which should be added to the Cucumber report as hooks?
 * There are 3 rules of adding:
 * 1. if hook has a name
 * 2. if hook has attachments
 * 3. if hook has an error
 */
import * as messages from '@cucumber/messages';
import { TestCaseRun } from './TestCaseRun';
import { Hook, HookType } from './Hook';
import { BddTestAttachment } from '../../../run/bddWorldInternal';
import { GherkinDocumentWithPickles } from '../../../cucumber/loadFeatures';
import { stringifyLocation } from '../../../utils';

type HookWithStep = {
  hook: Hook;
  testStep: messages.TestStep;
};

export class TestCase {
  private beforeHooks = new Map</* internalId */ string, HookWithStep>();
  private afterHooks = new Map</* internalId */ string, HookWithStep>();
  private mainSteps: messages.TestStep[] = [];
  private pickle?: messages.Pickle;

  constructor(
    public id: string,
    private gherkinDocuments: GherkinDocumentWithPickles[],
  ) {}

  addRun(testCaseRun: TestCaseRun) {
    this.addHooks(testCaseRun, 'before');
    this.addHooks(testCaseRun, 'after');
    if (!this.pickle) {
      this.pickle = this.findPickle(testCaseRun.bddData);
      this.addStepsFromPickle(this.pickle);
    }
    this.addStepsArgumentsLists(testCaseRun);
  }

  getHooks(hookType: HookType) {
    return hookType == 'before' ? this.beforeHooks : this.afterHooks;
  }

  getMainSteps() {
    return this.mainSteps;
  }

  buildMessage() {
    const testSteps = [
      ...Array.from(this.beforeHooks.values()).map((hook) => hook.testStep),
      ...(this.mainSteps || []),
      ...Array.from(this.afterHooks.values()).map((hook) => hook.testStep),
    ];
    if (!this.pickle) throw new Error(`Empty pickle`);
    const testCase: messages.TestCase = {
      id: this.id,
      pickleId: this.pickle.id,
      testSteps,
    };
    return { testCase };
  }

  /**
   * We collect hooks from all runs of this test case, avoiding duplicates.
   */
  private addHooks(testCaseRun: TestCaseRun, hookType: HookType) {
    const testCaseHooks = hookType === 'before' ? this.beforeHooks : this.afterHooks;
    const testRunHooks = testCaseRun.getExecutedHooks(hookType);

    testRunHooks.forEach(({ hook }) => {
      if (testCaseHooks.has(hook.internalId)) return;
      const testStep: messages.TestStep = {
        id: `${this.id}-${hookType}-${testCaseHooks.size}`,
        hookId: hook.id,
      };
      testCaseHooks.set(hook.internalId, { hook, testStep });
    });
  }

  /**
   * Initially create steps from pickle steps, with empty stepMatchArgumentsLists.
   */
  private addStepsFromPickle(pickle: messages.Pickle) {
    this.mainSteps = pickle.steps.map((pickleStep, stepIndex) => {
      return {
        id: `${this.id}-step-${stepIndex}`,
        pickleStepId: pickleStep.id,
        stepDefinitionIds: [],
        stepMatchArgumentsLists: [],
      };
    });
  }

  /**
   * Fill stepMatchArgumentsLists from all test runs.
   * It allows to fill as many steps as possible.
   * Possibly, we write the same stepMatchArgumentsLists several times,
   * looks like it's not a problem as they should be equal for all runs.
   */
  private addStepsArgumentsLists(testCaseRun: TestCaseRun) {
    testCaseRun.bddData.steps.forEach((bddDataStep, stepIndex) => {
      const testCaseStep = this.mainSteps?.[stepIndex];
      if (testCaseStep && bddDataStep.stepMatchArgumentsLists) {
        testCaseStep.stepMatchArgumentsLists = bddDataStep.stepMatchArgumentsLists;
      }
    });
  }

  private findPickle({ uri, pickleLocation }: BddTestAttachment) {
    const doc = this.gherkinDocuments.find((doc) => doc.uri === uri);
    if (!doc) throw new Error('gherkinDocument not found');
    const pickle = doc.pickles.find((pickle) => {
      return stringifyLocation(pickle.location) === pickleLocation;
    });
    if (!pickle) throw new Error('pickle not found');
    return pickle;
  }
}
