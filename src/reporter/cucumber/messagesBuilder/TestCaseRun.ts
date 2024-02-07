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
import { collectStepsWithCategory, getHooksRootStep } from './pwUtils';
import {
  BddDataAttachment,
  BddDataStep,
  getBddDataFromTestResult,
} from '../../../run/bddDataAttachment';
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
  attachmentMapper: AttachmentMapper;
  private executedBeforeHooks: TestCaseRunHooks;
  private executedAfterHooks: TestCaseRunHooks;
  private executedSteps: ExecutedStepInfo[];

  // eslint-disable-next-line max-params
  constructor(
    public test: pw.TestCase,
    public result: pw.TestResult,
    public hooks: MapWithCreate<string, Hook>,
  ) {
    this.id = this.generateTestRunId();
    this.bddData = this.getBddData();
    this.attachmentMapper = new AttachmentMapper(this.result);
    this.executedSteps = this.fillExecutedSteps();
    this.executedBeforeHooks = this.fillExecutedHooks('before');
    this.executedAfterHooks = this.fillExecutedHooks('after');
  }

  getTestCase() {
    if (!this.testCase) throw new Error(`TestCase is not set.`);
    return this.testCase;
  }

  private generateTestRunId() {
    return `${this.test.id}-run-${this.result.retry}`;
  }

  private getBddData() {
    const bddData = getBddDataFromTestResult(this.result);
    if (!bddData) {
      throw new Error(
        [
          `BDD data attachment is not found for test: ${this.test.title}`,
          `Did you set bddAttachments: true in the Playwright config?`,
          '',
        ].join('\n'),
      );
    }
    return bddData;
  }

  private fillExecutedSteps() {
    const possiblePwSteps = this.getPossiblePlaywrightSteps();
    return this.bddData.steps.map((bddDataStep) => {
      const pwStep = this.findPlaywrightStep(possiblePwSteps, bddDataStep);
      return { bddDataStep, pwStep };
    });
  }

  private fillExecutedHooks(hookType: HookType) {
    return new TestCaseRunHooks(this, hookType).fill(this.executedSteps);
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
    if (!pwStep) throw new Error('Playwright step not found for bdd step');
    return pwStep;
  }

  private getPossiblePlaywrightSteps() {
    const beforeHooksRoot = getHooksRootStep(this.result, 'before');
    const bgSteps = collectStepsWithCategory(beforeHooksRoot, 'test.step');
    const topLevelSteps = this.result.steps.filter((step) => step.category === 'test.step');
    return [...bgSteps, ...topLevelSteps];
  }
}
