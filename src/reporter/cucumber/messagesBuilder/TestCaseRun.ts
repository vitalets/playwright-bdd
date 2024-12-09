/**
 * Class representing single run of a test case.
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { Hook, HookType } from './Hook';
import { TestCase } from './TestCase';
import { AutofillMap } from '../../../utils/AutofillMap.js';
import { TestStepRun, TestStepRunEnvelope } from './TestStepRun';
import { toCucumberTimestamp } from './timing';
import { collectStepsWithCategory, isUnknownDuration } from './pwStepUtils';
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

export type ExecutedStepInfo = {
  bddStep: BddStepData;
  // pwStep can be missing even for executed steps when there is test timeout
  pwStep?: pw.TestStep;
};

export class TestCaseRun {
  id: string;
  testCase?: TestCase;
  attachmentMapper: AttachmentMapper;
  projectInfo: ProjectInfo;
  // collect steps with error and show only these errors in report.
  // it allows to not show the same error on parent steps
  errorSteps = new Set<pw.TestStep>();
  timeoutedStep?: pw.TestStep;
  private executedBeforeHooks: TestCaseRunHooks;
  private executedAfterHooks: TestCaseRunHooks;
  private executedSteps: ExecutedStepInfo[];

  // eslint-disable-next-line max-params
  constructor(
    public bddTestData: BddTestData,
    public featureUri: string,
    public test: pw.TestCase,
    public result: pw.TestResult,
    public hooks: AutofillMap<string, Hook>,
  ) {
    this.id = this.generateTestRunId();
    this.projectInfo = getProjectInfo(this.test);
    this.attachmentMapper = new AttachmentMapper(this.result);
    this.executedSteps = this.fillExecutedSteps();
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

  private generateTestRunId() {
    return `${this.test.id}-attempt-${this.result.retry}`;
  }

  private fillExecutedSteps() {
    const possiblePwSteps = this.getPossiblePlaywrightBddSteps();
    return this.bddTestData.steps.map((bddStep) => {
      const pwStep = this.findPlaywrightStep(possiblePwSteps, bddStep);
      this.collectErrorStep(pwStep);
      this.collectTimeoutedStep(pwStep);
      return { bddStep, pwStep };
    });
  }

  private fillExecutedHooks(hookType: HookType) {
    return new TestCaseRunHooks(this, hookType).fill(this.executedSteps);
  }

  collectErrorStep(pwStep?: pw.TestStep) {
    if (pwStep?.error) this.errorSteps.add(pwStep);
  }

  // eslint-disable-next-line visual/complexity
  private collectTimeoutedStep(pwStep?: pw.TestStep) {
    if (!pwStep || !this.isTimeouted() || this.timeoutedStep) return;
    const { error } = pwStep;
    // Assumption: timeouted BDD step always has duration -1 and 'error' field.
    if (isUnknownDuration(pwStep) || this.result.errors.some((e) => e.message === error?.message)) {
      this.timeoutedStep = pwStep;
    }
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

  getExecutedHooks(hookType: HookType) {
    return hookType === 'before'
      ? this.executedBeforeHooks.executedHooks
      : this.executedAfterHooks.executedHooks;
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
        const { pwStep } = this.executedSteps[stepIndex] || {};
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

  private getPossiblePlaywrightBddSteps() {
    // Before we collected only top-level steps and steps from before hooks (as they are background)
    // But it's more reliable to just collect all test.step items b/c some Playwright versions
    // move steps to fixtures (see: https://github.com/microsoft/playwright/issues/30075)
    // Collecting all test.step items should be ok, as later we anyway map them by location.
    return collectStepsWithCategory(this.result, 'test.step');
  }
}
