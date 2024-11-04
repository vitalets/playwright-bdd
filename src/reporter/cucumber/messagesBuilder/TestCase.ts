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
import { GherkinDocumentWithPickles, PickleWithLocation } from '../../../features/types';
import { ProjectInfo } from './Projects';

type HookWithStep = {
  hook: Hook;
  testStep: messages.TestStep;
};

export class TestCase {
  #pickle?: PickleWithLocation;
  #projectInfo?: ProjectInfo;
  private beforeHooks = new Map</* internalId */ string, HookWithStep>();
  private afterHooks = new Map</* internalId */ string, HookWithStep>();
  private mainSteps: messages.TestStep[] = [];

  constructor(
    public id: string,
    private gherkinDocuments: GherkinDocumentWithPickles[],
  ) {}

  get projectInfo() {
    if (!this.#projectInfo) throw new Error(`Empty projectInfo for testCase: ${this.id}`);
    return this.#projectInfo;
  }

  get pickle() {
    if (!this.#pickle) throw new Error(`Empty pickle for testCase: ${this.id}`);
    return this.#pickle;
  }

  addRun(testCaseRun: TestCaseRun) {
    if (!this.#projectInfo) this.#projectInfo = testCaseRun.projectInfo;
    this.addHooks(testCaseRun, 'before');
    this.addHooks(testCaseRun, 'after');
    if (!this.#pickle) {
      this.#pickle = this.findPickle(testCaseRun);
      this.addStepsFromPickle(this.#pickle);
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
    testCaseRun.bddData?.steps.forEach((bddDataStep, stepIndex) => {
      // map executed step from bddData to pickle step by index!
      const testCaseStep = this.mainSteps?.[stepIndex];
      if (testCaseStep && bddDataStep.stepMatchArguments) {
        testCaseStep.stepMatchArgumentsLists = [
          { stepMatchArguments: bddDataStep.stepMatchArguments },
        ];
      }
    });
  }

  private findPickle(testCaseRun: TestCaseRun) {
    const featureUri = testCaseRun.getFeatureUri();
    const doc = this.gherkinDocuments.find((doc) => doc.uri === featureUri);
    if (!doc) throw new Error('GherkinDocument not found');
    const pickleLineNumber = testCaseRun.getPickleLineNumber();
    const pickle = doc.pickles.find((pickle) => {
      return pickle.location.line === pickleLineNumber;
    });
    if (!pickle) throw new Error('Pickle not found');
    return pickle;
  }
}
