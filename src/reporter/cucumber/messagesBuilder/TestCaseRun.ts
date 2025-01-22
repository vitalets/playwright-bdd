/**
 * Class representing single run of a test case.
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { Hook, HooksGroup } from './Hook';
import { TestCase } from './TestCase';
import { AutofillMap } from '../../../utils/AutofillMap.js';
import { TestStepRun, TestStepRunEnvelope } from './TestStepRun';
import { toCucumberTimestamp } from './timing';
import { areTestErrorsEqual, isTopLevelStep, isUnknownDuration, walkSteps } from './pwStepUtils';
import { AttachmentMapper } from './AttachmentMapper';
import { TestCaseRunHooks } from './TestCaseRunHooks';
import { ProjectInfo, getProjectInfo } from './Projects';
import { BddStepData, BddTestData } from '../../../bddData/types';

export type TestCaseRunEnvelope = TestStepRunEnvelope &
  Pick<
    messages.Envelope,
    | 'testCaseStarted' // prettier-ignore
    | 'testCaseFinished'
  >;

type ExecutedBddStepInfo = {
  bddStep: BddStepData;
  // pwStep can be missing even for executed steps when there is test timeout
  pwStep?: pw.TestStep;
};

export class TestCaseRun {
  id: string;
  testCase?: TestCase;
  attachmentMapper: AttachmentMapper;
  projectInfo: ProjectInfo;
  // Collect steps with error and show only these errors in report,
  // it allows to not show the same error of parent steps.
  // Usually, value contains step.error, but can be customized:
  // e.g. timeouted step may not have 'error' field.
  errorSteps = new Map<pw.TestStep, pw.TestError>();
  // Sometimes timeouted step has duration = -1, sometimes real duration.
  // This step is populated only for duration = -1.
  // For other cases timeout error message is shown in After Hooks as a fallback.
  timeoutedStep?: pw.TestStep;

  private executedBeforeHooks: TestCaseRunHooks;
  private executedAfterHooks: TestCaseRunHooks;
  public executedBddSteps: ExecutedBddStepInfo[];
  // root bg steps (can be several for Rules)
  private bgRoots = new Set<pw.TestStep>();

  // eslint-disable-next-line max-params
  constructor(
    public bddTestData: BddTestData,
    public featureUri: string,
    public test: pw.TestCase,
    public result: pw.TestResult,
    public hooks: AutofillMap<string, Hook>,
  ) {
    this.id = this.generateTestCaseRunId();
    this.projectInfo = getProjectInfo(this.test);
    // call order is important here
    this.attachmentMapper = new AttachmentMapper(this.result);
    this.executedBddSteps = this.fillExecutedBddSteps();
    this.executedBeforeHooks = this.fillExecutedHooks('before');
    this.executedAfterHooks = this.fillExecutedHooks('after');
  }

  getTestCase() {
    if (!this.testCase) throw new Error(`TestCase is not set.`);
    return this.testCase;
  }

  isTimeouted() {
    return this.result.status === 'timedOut';
  }

  buildMessages() {
    return [
      this.buildTestCaseStarted(),
      ...this.executedBeforeHooks.buildMessages(),
      ...this.buildStepRuns(),
      ...this.executedAfterHooks.buildMessages(),
      this.buildTestCaseFinished(),
    ];
  }

  getExecutedHooks(hookType: HooksGroup) {
    return hookType === 'before'
      ? this.executedBeforeHooks.executedHooks
      : this.executedAfterHooks.executedHooks;
  }

  getStepError(pwStep: pw.TestStep) {
    return this.errorSteps.get(pwStep);
  }

  private generateTestCaseRunId() {
    return `${this.test.id}-attempt-${this.result.retry}`;
  }

  private fillExecutedBddSteps() {
    const possiblePwSteps = this.getPossiblePwSteps();
    return this.bddTestData.steps.map((bddStep) => {
      return this.fillExecutedBddStep(bddStep, possiblePwSteps);
    });
  }

  // eslint-disable-next-line visual/complexity
  private fillExecutedBddStep(bddStep: BddStepData, possiblePwSteps: pw.TestStep[]) {
    const pwStep = this.findPlaywrightStep(possiblePwSteps, bddStep);
    if (pwStep?.error) {
      this.registerErrorStep(pwStep, pwStep.error);
    }
    if (this.isTimeouted() && pwStep && isUnknownDuration(pwStep)) {
      this.registerTimeoutedStep(pwStep);
    }
    if (pwStep?.parent && bddStep.isBg) {
      this.bgRoots.add(pwStep.parent);
    }
    if (pwStep) {
      this.attachmentMapper.populateStepAttachments(pwStep);
    }

    return { bddStep, pwStep };
  }

  private fillExecutedHooks(hookType: HooksGroup) {
    return new TestCaseRunHooks(this, hookType, this.bgRoots).fill();
  }

  registerErrorStep(pwStep: pw.TestStep, error: pw.TestError) {
    this.errorSteps.set(pwStep, error);
  }

  hasRegisteredError(error: pw.TestError) {
    for (const registeredError of this.errorSteps.values()) {
      if (areTestErrorsEqual(registeredError, error)) return true;
    }
  }

  registerTimeoutedStep(pwStep: pw.TestStep) {
    if (this.timeoutedStep) return;

    this.timeoutedStep = pwStep;

    // Handle case when timeouted step has duration -1 and no 'error' field,
    // but it's parent contains actual error.
    // - timeout in bg step
    // - timeout in hooks
    // We register timeouted step with error from parent.
    if (!pwStep.error && pwStep.parent?.error && !isTopLevelStep(pwStep)) {
      this.registerErrorStep(this.timeoutedStep, pwStep.parent.error);
    }
  }

  getUnprocessedErrors() {
    return this.result.errors.filter((error) => !this.isProcessedError(error));
  }

  private isProcessedError(error: pw.TestError) {
    for (const pwStepError of this.errorSteps.values()) {
      if (areTestErrorsEqual(pwStepError, error)) {
        return true;
      }
    }
  }

  private buildTestCaseStarted() {
    const testCaseStarted: messages.TestCaseStarted = {
      id: this.id,
      attempt: this.result.retry,
      testCaseId: this.getTestCase().id,
      // workerId: 'worker-1'
      timestamp: toCucumberTimestamp(this.result.startTime.getTime()),
    };
    return { testCaseStarted };
  }

  private buildStepRuns() {
    return this.getTestCase()
      .getSteps()
      .reduce((messages: TestStepRunEnvelope[], testStep, stepIndex) => {
        const { pwStep } = this.executedBddSteps[stepIndex] || {};
        const testStepRun = new TestStepRun(this, testStep, pwStep);
        return messages.concat(testStepRun.buildMessages());
      }, []);
  }

  private buildTestCaseFinished() {
    const { startTime, duration } = this.result;
    const testCaseFinished: messages.TestCaseFinished = {
      testCaseStartedId: this.id,
      willBeRetried: Boolean(this.result.error && this.result.retry < this.test.retries),
      timestamp: toCucumberTimestamp(startTime.getTime() + duration),
    };
    return { testCaseFinished };
  }

  private findPlaywrightStep(possiblePwSteps: pw.TestStep[], bddStep: BddStepData) {
    return possiblePwSteps.find((pwStep) => {
      // todo: filter by file earlier?
      return (
        pwStep.location?.file === this.test.location.file &&
        pwStep.location?.line === bddStep.pwStepLine
      );
    });
  }

  private getPossiblePwSteps() {
    // Before we collected only top-level steps and steps from before hooks (as they are background)
    // But it's more reliable to just collect all test.step items b/c some Playwright versions
    // move steps to fixtures (see: https://github.com/microsoft/playwright/issues/30075)
    // Collecting all test.step items should be ok, as later we anyway map them by location.
    return walkSteps(this.result.steps).filter((pwStep) => pwStep.category === 'test.step');
  }
}
