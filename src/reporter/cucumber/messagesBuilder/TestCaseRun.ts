/**
 * Class representing single run of a test case.
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { stringifyLocation } from '../../../utils/index.js';
import { Hook, HookType } from './Hook';
import { TestCase } from './TestCase';
import { AutofillMap } from '../../../utils/AutofillMap.js';
import { TestStepRun, TestStepRunEnvelope } from './TestStepRun';
import { toCucumberTimestamp } from './timing';
import { collectStepsWithCategory, isUnknownDuration } from './pwStepUtils';
import { AttachmentMapper } from './AttachmentMapper';
import { TestCaseRunHooks } from './TestCaseRunHooks';
import { ProjectInfo, getProjectInfo } from './Projects';
import { BddData, BddDataStep } from '../../../run/bddAnnotation/types.js';
import { getBddDataFromTest } from '../../../run/bddAnnotation/index.js';

export type TestCaseRunEnvelope = TestStepRunEnvelope &
  Pick<
    messages.Envelope,
    | 'testCaseStarted' // prettier-ignore
    | 'testCaseFinished'
  >;

export type ExecutedStepInfo = {
  bddDataStep: BddDataStep;
  // pwStep can be missing even for executed steps when there is test timeout
  pwStep?: pw.TestStep;
};

export class TestCaseRun {
  id: string;
  bddData: BddData;
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

  constructor(
    public test: pw.TestCase,
    public result: pw.TestResult,
    public hooks: AutofillMap<string, Hook>,
  ) {
    this.id = this.generateTestRunId();
    this.bddData = this.extractBddData();
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

  private extractBddData() {
    const { bddData } = getBddDataFromTest(this.test);
    if (!bddData) {
      throw new Error(`__bddData annotation is not found for test "${this.test.title}".`);
    }
    // We could delete __bddData annotation here to hide it from other reporters,
    // but it leads to errors on Win.
    // Better way is to get some official way to pass custom data to reporters,
    // see: https://github.com/microsoft/playwright/issues/30179
    // this.test.annotations.splice(annotationIndex, 1);
    return bddData;
  }

  private fillExecutedSteps() {
    const possiblePwSteps = this.getPossiblePlaywrightBddSteps();
    return this.bddData.steps.map((bddDataStep) => {
      const pwStep = this.findPlaywrightStep(possiblePwSteps, bddDataStep);
      this.registerErrorStep(pwStep);
      this.registerTimeoutedStep(pwStep);
      return { bddDataStep, pwStep };
    });
  }

  private fillExecutedHooks(hookType: HookType) {
    return new TestCaseRunHooks(this, hookType).fill(this.executedSteps);
  }

  registerErrorStep(pwStep?: pw.TestStep) {
    if (pwStep?.error) this.errorSteps.add(pwStep);
  }

  // eslint-disable-next-line visual/complexity
  registerTimeoutedStep(pwStep?: pw.TestStep) {
    if (!pwStep || !this.isTimeouted() || this.timeoutedStep) return;
    const { error } = pwStep;
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
      .getMainSteps()
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

  private findPlaywrightStep(possiblePwSteps: pw.TestStep[], bddDataStep: BddDataStep) {
    return possiblePwSteps.find((pwStep) => {
      return pwStep.location && stringifyLocation(pwStep.location) === bddDataStep.pwStepLocation;
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
