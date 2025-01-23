/**
 * Builds particular cucumber testCase.
 * One testCase can have multiple runs, because of retries.
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
import { Hook, HooksGroup } from './Hook';
import { GherkinDocumentWithPickles, PickleWithLocation } from '../../../gherkin/types';
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
  // in test case there are also hook steps, they are not included in this list
  private steps: messages.TestStep[] = [];

  constructor(
    public id: string,
    private gherkinDocuments: GherkinDocumentWithPickles[],
    private testRunStartedId: string,
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
      this.createStepsFromPickle(this.#pickle);
    }
    this.addStepsArgumentsLists(testCaseRun);
  }

  getHooks(hookType: HooksGroup) {
    return hookType == 'before' ? this.beforeHooks : this.afterHooks;
  }

  getSteps() {
    return this.steps;
  }

  buildMessage() {
    const testSteps = [
      ...Array.from(this.beforeHooks.values()).map((hook) => hook.testStep),
      ...(this.steps || []),
      ...Array.from(this.afterHooks.values()).map((hook) => hook.testStep),
    ];

    const testCase: messages.TestCase = {
      testRunStartedId: this.testRunStartedId,
      id: this.id,
      pickleId: this.pickle.id,
      testSteps,
    };
    return { testCase };
  }

  /**
   * We collect hooks from all runs of this test case, avoiding duplicates.
   */
  private addHooks(testCaseRun: TestCaseRun, hookType: HooksGroup) {
    const testCaseHooks = hookType === 'before' ? this.beforeHooks : this.afterHooks;
    const testCaseRunHooks = testCaseRun.getExecutedHooks(hookType);

    testCaseRunHooks.forEach((executedHookInfo) => {
      const { hook } = executedHookInfo;
      if (testCaseHooks.has(hook.internalId)) return;
      const hookTypeStr = hook.hookType.toLowerCase().replaceAll('_', '-');
      const testStep: messages.TestStep = {
        id: `${this.id}-${hookTypeStr}-${testCaseHooks.size}`,
        hookId: hook.id,
      };
      testCaseHooks.set(hook.internalId, { hook, testStep });
    });
  }

  /**
   * Initially create steps from pickle steps, with empty stepMatchArgumentsLists.
   */
  private createStepsFromPickle(pickle: messages.Pickle) {
    this.steps = pickle.steps.map((pickleStep, stepIndex) => {
      return {
        id: `${this.id}-step-${stepIndex}`,
        pickleStepId: pickleStep.id,
        stepDefinitionIds: [],
        stepMatchArgumentsLists: [],
      };
    });
  }

  /**
   * Fill stepMatchArgumentsLists from all test retries.
   * It allows to fill as many steps as possible.
   * Possibly, we write the same stepMatchArgumentsLists several times,
   * looks like it's not a problem as they should be equal for all retries.
   */
  private addStepsArgumentsLists(testCaseRun: TestCaseRun) {
    testCaseRun.bddTestData.steps.forEach((bddStep, stepIndex) => {
      // map executed step from bddTestData to pickle step by index
      const testCaseStep = this.steps[stepIndex];
      if (testCaseStep && bddStep.stepMatchArguments) {
        testCaseStep.stepMatchArgumentsLists = [{ stepMatchArguments: bddStep.stepMatchArguments }];
      }
    });
  }

  private findPickle(testCaseRun: TestCaseRun) {
    const doc = this.gherkinDocuments.find((doc) => doc.uri === testCaseRun.featureUri);
    if (!doc) {
      throw new Error(`GherkinDocument not found for test: ${testCaseRun.test.title}`);
    }

    const pickle = doc.pickles.find((pickle) => {
      return pickle.location.line === testCaseRun.bddTestData.pickleLine;
    });

    if (!pickle) {
      throw new Error(
        [
          `Pickle not found for test: ${testCaseRun.test.title}`,
          `Gherkin document: ${doc.uri}`,
        ].join('\n'),
      );
    }

    return pickle;
  }
}
