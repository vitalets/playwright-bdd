/**
 * Class representing single run of a test case.
 */
import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
import { BddTestAttachment } from '../../../run/bddWorldInternal';
import { stringifyLocation } from '../../../utils';
import { isGeneratedAttachmentName } from '../../../run/AttachmentAdapter';

export class TestCaseRun {
  private messages: messages.Envelope[] = [];
  private _bddData?: BddTestAttachment;
  private _testCase?: messages.TestCase;
  private _pwSteps?: pw.TestStep[];

  constructor(
    public test: pw.TestCase,
    public result: pw.TestResult,
  ) {}

  get testCase() {
    if (!this._testCase) throw new Error('TestCase is not set');
    return this._testCase;
  }

  set testCase(testCase: messages.TestCase) {
    this._testCase = testCase;
  }

  get id() {
    return `${this.test.id}-run-${this.result.retry}`;
  }

  get bddData() {
    if (!this._bddData) {
      const bddAttachment = this.result.attachments.find((a) => a.name === '__bddData');
      const strData = bddAttachment?.body?.toString();
      if (!strData) throw new Error('Bdd attachment is not found');
      // todo: delete attachment
      this._bddData = JSON.parse(strData) as BddTestAttachment;
    }
    return this._bddData;
  }

  get pwSteps() {
    if (!this._pwSteps) {
      this._pwSteps = getPlaywrightStepsRecursive(this.result);
    }
    return this._pwSteps;
  }

  buildMessages() {
    this.addTestCaseStarted();
    this.testCase.testSteps.forEach((testStep, stepIndex) => {
      const pwStep = this.getPlaywrightStep(stepIndex);
      this.addTestStepStarted(testStep, pwStep);
      this.addStepAttachments(testStep, stepIndex);
      this.addTestStepFinished(testStep, pwStep);
    });
    this.addTestCaseFinished();
    return this.messages;
  }

  private addTestCaseStarted() {
    const testCaseStarted: messages.TestCaseStarted = {
      id: this.id,
      attempt: this.result.retry,
      testCaseId: this.testCase.id,
      // workerId: 'worker-1'
      timestamp: messages.TimeConversion.millisecondsSinceEpochToTimestamp(
        this.result.startTime.getTime(),
      ),
    };
    this.messages.push({ testCaseStarted });
  }

  private addTestCaseFinished() {
    const testCaseFinished: messages.TestCaseFinished = {
      testCaseStartedId: this.id,
      willBeRetried: Boolean(this.result.error && this.result.retry < this.test.retries),
      timestamp: messages.TimeConversion.millisecondsSinceEpochToTimestamp(
        this.result.startTime.getTime() + this.result.duration,
      ),
    };
    this.messages.push({ testCaseFinished });
  }

  private addTestStepStarted(testStep: messages.TestStep, pwStep: pw.TestStep) {
    const testStepStarted: messages.TestStepStarted = {
      testCaseStartedId: this.id,
      testStepId: testStep.id,
      timestamp: messages.TimeConversion.millisecondsSinceEpochToTimestamp(
        pwStep.startTime.getTime(),
      ),
    };
    this.messages.push({ testStepStarted });
  }

  private addTestStepFinished(testStep: messages.TestStep, pwStep: pw.TestStep) {
    const { error } = pwStep;
    const testStepFinished: messages.TestStepFinished = {
      testCaseStartedId: this.id,
      testStepId: testStep.id,
      testStepResult: {
        duration: messages.TimeConversion.millisecondsToDuration(pwStep.duration),
        status: error ? messages.TestStepResultStatus.FAILED : messages.TestStepResultStatus.PASSED,
        message: error ? error.stack : undefined,
        exception: error ? { message: error.message, type: 'Error' } : undefined,
      },
      timestamp: messages.TimeConversion.millisecondsSinceEpochToTimestamp(
        pwStep.startTime.getTime() + pwStep.duration,
      ),
    };
    this.messages.push({ testStepFinished });
  }

  private getBddDataStep(stepIndex: number) {
    // find bddDataStep just by index
    return this.bddData.steps[stepIndex];
  }

  private getPlaywrightStep(stepIndex: number) {
    const bddDataStep = this.getBddDataStep(stepIndex);
    const pwStep = this.pwSteps.find((pwStep) => {
      return pwStep.location && stringifyLocation(pwStep.location) === bddDataStep.pwStepLocation;
    });
    if (!pwStep) throw new Error('pwStep not found');
    return pwStep;
  }

  private addStepAttachments(testStep: messages.TestStep, stepIndex: number) {
    this.getStepAttachments(stepIndex).forEach((pwAttachment) => {
      if (pwAttachment.name === '__bddData') return;
      // todo: support file attachments
      if (pwAttachment.body) {
        const attachment: messages.Attachment = {
          // for now always attach as base64
          // todo: for text/plain and application/json use raw to save some bytes
          body: pwAttachment.body.toString('base64'),
          contentEncoding: messages.AttachmentContentEncoding.BASE64,
          mediaType: pwAttachment.contentType,
          fileName: isGeneratedAttachmentName(pwAttachment) ? undefined : pwAttachment.name,
          testCaseStartedId: this.id,
          testStepId: testStep.id,
        };
        this.messages.push({ attachment });
      }
    });
  }

  private getStepAttachments(stepIndex: number) {
    const { attachmentsStartIndex } = this.getBddDataStep(stepIndex);
    const isLastStep = stepIndex === this.bddData.steps.length - 1;
    const attachmentsEndIndex = isLastStep
      ? this.result.attachments.length
      : this.getBddDataStep(stepIndex + 1).attachmentsStartIndex;
    return this.result.attachments.slice(attachmentsStartIndex, attachmentsEndIndex);
  }
}

/**
 * Returns Playwright steps marked as 'test.step' category.
 * Filters out fixtures steps.
 * todo: replace recursion with algorithm
 */
function getPlaywrightStepsRecursive({ steps }: pw.TestResult | pw.TestStep) {
  return steps.reduce<pw.TestStep[]>((acc, step) => {
    acc.push(...getPlaywrightStepsRecursive(step));
    if (step.category === 'test.step' && step.location) acc.push(step);
    return acc;
  }, []);
}
