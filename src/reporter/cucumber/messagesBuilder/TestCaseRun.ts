/**
 * Class representing single run of a test case.
 *
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { stringifyLocation, toBoolean } from '../../../utils';
import { Hook, HookType } from './Hook';
import { TestCase } from './TestCase';
import { MapWithCreate } from '../../../utils/MapWithCreate';
import { TestStepRun, TestStepRunEnvelope } from './TestStepRun';
import { toCucumberTimestamp } from './timing';
import { findDeepestErrorStep, getHooksRootStep, getPlaywrightStepsWithCategory } from './pwUtils';
import { Attachments, getAttachmentStepName } from './Attachments';
import {
  BDD_DATA_ATTACHMENT_NAME,
  BddDataAttachment,
  BddDataStep,
  getBddDataFromTestResult,
} from '../../../run/attachments/BddData';

export type TestCaseRunEnvelope = TestStepRunEnvelope &
  Pick<
    messages.Envelope,
    | 'testCaseStarted' // prettier-ignore
    | 'testCaseFinished'
  >;

type ExecutedHookInfo = {
  hook: Hook;
  pwStep: pw.TestStep;
};

type ExecutedStepInfo = {
  bddDataStep: BddDataStep;
  pwStep: pw.TestStep;
};

export class TestCaseRun {
  id: string;
  bddData: BddDataAttachment;
  _testCase?: TestCase;
  executedBeforeHooks = new Map</* internalId */ string, ExecutedHookInfo>();
  executedAfterHooks = new Map</* internalId */ string, ExecutedHookInfo>();
  attachments: Attachments;
  private executedSteps: ExecutedStepInfo[] = [];
  private messages: TestCaseRunEnvelope[] = [];

  constructor(
    public test: pw.TestCase,
    public result: pw.TestResult,
    private hooks: MapWithCreate<string, Hook>,
  ) {
    this.id = `${this.test.id}-run-${this.result.retry}`;
    this.bddData = this.getBddData();
    this.fillExecutedSteps();
    this.fillExecutedHooks('before');
    this.fillExecutedHooks('after');
    this.attachments = new Attachments(this);
  }

  get testCase() {
    if (!this._testCase) throw new Error(`TestCase is not set.`);
    return this._testCase;
  }

  set testCase(testCase) {
    this._testCase = testCase;
  }

  private getBddData() {
    const bddData = getBddDataFromTestResult(this.result);
    if (!bddData) {
      const attachmentNames = this.result.attachments.map((a) => a.name);
      throw new Error(
        [
          `BDD data attachment is not found for test: ${this.test.title}`,
          `Available attachments: ${attachmentNames.join(', ')}`,
        ].join('\n'),
      );
    }
    return bddData;
  }

  private fillExecutedSteps() {
    const possiblePwSteps = this.getPossiblePlaywrightSteps();
    this.bddData.steps.forEach((bddDataStep) => {
      const pwStep = this.findPlaywrightStep(possiblePwSteps, bddDataStep);
      this.executedSteps.push({ bddDataStep, pwStep });
    });
  }

  private fillExecutedHooks(hookType: HookType) {
    const rootStep = getHooksRootStep(this.result, hookType);

    const pwStepsWithName = getPlaywrightStepsWithCategory(rootStep, 'test.step')
      .filter((pwStep) => Boolean(pwStep.title)); // prettier-ignore

    const pwStepsWithAttachment = getPlaywrightStepsWithCategory(rootStep, 'attach')
      .filter((pwStep) => !isBddDataAttachmentStep(pwStep))
      .map((pwStep) => pwStep.parent);

    const pwStepWithError = findDeepestErrorStep(rootStep);
    const hookSteps = new Set(
      [...pwStepsWithName, ...pwStepsWithAttachment, pwStepWithError].filter(toBoolean),
    );

    // exclude background steps, b/c they are in pickle, not in hooks.
    // Important to run this fn after this.fillExecutedSteps()
    // as we assume steps are already populated
    if (hookType === 'before') {
      this.executedSteps.forEach((stepInfo) => hookSteps.delete(stepInfo.pwStep));
    }

    hookSteps.forEach((pwStep) => {
      const internalId = Hook.getInternalId(pwStep);
      const hook = this.hooks.getOrCreate(internalId, () => new Hook(internalId, pwStep));
      this.getExecutedHooks(hookType).set(internalId, { hook, pwStep });
    });
  }

  buildMessages() {
    this.addTestCaseStarted();
    this.addHookRuns('before');
    this.addStepRuns();
    this.addHookRuns('after');
    this.addTestCaseFinished();
    return this.messages;
  }

  getExecutedHooks(hookType: HookType) {
    return hookType === 'before' ? this.executedBeforeHooks : this.executedAfterHooks;
  }

  private addTestCaseStarted() {
    const testCaseStarted: messages.TestCaseStarted = {
      id: this.id,
      attempt: this.result.retry,
      testCaseId: this.testCase.id,
      // workerId: 'worker-1'
      timestamp: toCucumberTimestamp(this.result.startTime.getTime()),
    };
    this.messages.push({ testCaseStarted });
  }

  private addHookRuns(hookType: HookType) {
    this.testCase.getHooks(hookType).forEach((hookInfo) => {
      const executedHook = this.getExecutedHooks(hookType).get(hookInfo.hook.internalId);
      // todo: if pwStep is not found in this.executedBeforeHooks,
      // it means that this hook comes from another run of this test case.
      // We can stil try to find it in test result, as otherwise it will be marked as skipped,
      // but actually it was executed.
      const testStepRun = new TestStepRun(this, hookInfo.testStep, executedHook?.pwStep);
      this.messages.push(...testStepRun.buildMessages());
    });
  }

  private addStepRuns() {
    this.testCase.getMainSteps().forEach((testStep, stepIndex) => {
      const { pwStep } = this.executedSteps[stepIndex] || {};
      const testStepRun = new TestStepRun(this, testStep, pwStep);
      this.messages.push(...testStepRun.buildMessages());
    });
  }

  private addTestCaseFinished() {
    const { startTime, duration } = this.result;
    const testCaseFinished: messages.TestCaseFinished = {
      testCaseStartedId: this.id,
      willBeRetried: Boolean(this.result.error && this.result.retry < this.test.retries),
      timestamp: toCucumberTimestamp(startTime.getTime() + duration),
    };
    this.messages.push({ testCaseFinished });
  }

  private findPlaywrightStep(possiblePwSteps: pw.TestStep[], bddDataStep: BddDataStep) {
    const pwStep = possiblePwSteps.find((pwStep) => {
      return pwStep.location && stringifyLocation(pwStep.location) === bddDataStep.pwStepLocation;
    });
    if (!pwStep) throw new Error('pwStep not found');
    return pwStep;
  }

  private getPossiblePlaywrightSteps() {
    const beforeEachRootStep = getHooksRootStep(this.result, 'before');
    const bgSteps = getPlaywrightStepsWithCategory(beforeEachRootStep, 'test.step');
    const topLevelSteps = this.result.steps.filter((step) => step.category === 'test.step');
    return [...bgSteps, ...topLevelSteps];
  }
}

function isBddDataAttachmentStep(pwStep: pw.TestStep) {
  return pwStep.title === getAttachmentStepName(BDD_DATA_ATTACHMENT_NAME);
}
