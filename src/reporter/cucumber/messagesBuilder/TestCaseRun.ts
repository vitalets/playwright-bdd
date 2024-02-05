/**
 * Class representing single run of a test case.
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { stringifyLocation } from '../../../utils';
import { Hook, HookType } from './Hook';
import { TestCase } from './TestCase';
import { MapWithCreate } from '../../../utils/MapWithCreate';
import { TestStepRun, TestStepRunEnvelope } from './TestStepRun';
import { toCucumberTimestamp } from './timing';
import { getHooksRootStep, getPlaywrightStepsWithCategories } from './pwUtils';
import {
  BddDataAttachment,
  BddDataStep,
  getBddDataFromTestResult,
} from '../../../run/attachments/BddData';
import { AttachmentMapper } from './AttachmentMapper';
import { TestCaseRunHooks } from './TestCaseRunHooks';

export type TestCaseRunEnvelope = TestStepRunEnvelope &
  Pick<
    messages.Envelope,
    | 'testCaseStarted' // prettier-ignore
    | 'testCaseFinished'
  >;

export type ExecutedStepInfo = {
  bddDataStep: BddDataStep;
  pwStep: pw.TestStep;
};

export class TestCaseRun {
  id: string;
  bddData: BddDataAttachment;
  testCase?: TestCase;
  private executedBeforeHooks = new TestCaseRunHooks(this, 'before');
  private executedAfterHooks = new TestCaseRunHooks(this, 'after');
  private executedSteps: ExecutedStepInfo[] = [];

  // eslint-disable-next-line max-params
  constructor(
    public test: pw.TestCase,
    public result: pw.TestResult,
    public hooks: MapWithCreate<string, Hook>,
    public attachmentMapper: AttachmentMapper,
  ) {
    this.id = `${this.test.id}-run-${this.result.retry}`;
    this.bddData = this.getBddData();
    this.fillExecutedSteps();
    this.executedBeforeHooks.fill(this.executedSteps);
    this.executedAfterHooks.fill(this.executedSteps);
  }

  getTestCase() {
    if (!this.testCase) throw new Error(`TestCase is not set.`);
    return this.testCase;
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
    const pwStep = possiblePwSteps.find((pwStep) => {
      return pwStep.location && stringifyLocation(pwStep.location) === bddDataStep.pwStepLocation;
    });
    if (!pwStep) throw new Error('pwStep not found');
    return pwStep;
  }

  private getPossiblePlaywrightSteps() {
    const beforeHooksRoot = getHooksRootStep(this.result, 'before');
    const bgSteps = getPlaywrightStepsWithCategories(beforeHooksRoot, ['test.step']);
    const topLevelSteps = this.result.steps.filter((step) => step.category === 'test.step');
    return [...bgSteps, ...topLevelSteps];
  }
}
