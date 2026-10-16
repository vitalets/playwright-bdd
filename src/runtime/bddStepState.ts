/** BDD step API and the lifetime of its native Playwright step. */
import { TestStepInfo } from '@playwright/test';

export type BddStepFixture = {
  title: BddStepState['title'];
  docStringType?: BddStepState['docStringType'];
  readonly error?: BddStepState['error'];
  readonly info: BddStepState['info'];
  attach: BddStepState['attach'];
  skip: BddStepState['skip'];
};

export class BddStepState {
  // Current BDD step text, without its Gherkin keyword.
  title = '';
  // Media type of the current step's doc string, when provided.
  docStringType?: string;
  // Step failure; AfterStep hooks initially see the body failure, if any.
  // A thrown undefined is normalized to the string 'undefined'; skips leave it unset.
  error?: unknown;
  // Playwright skips by throwing. Store that exact error to distinguish intentional
  // skips from failures, including when a named hook swallows the exception.
  skipped?: Error;
  // AfterStep hooks may inspect the step and attach data, but cannot skip it.
  isAfterStepPhase = false;

  // Present only during step execution. The public info type excludes skip().
  private origInfo?: TestStepInfo;

  get info(): Omit<TestStepInfo, 'skip'> {
    if (!this.origInfo) {
      throw new Error('$step fixture is available only in BDD steps and step hooks.');
    }
    return this.origInfo;
  }

  attach(name: string, options?: Parameters<TestStepInfo['attach']>[1]) {
    return this.info.attach(name, options);
  }

  initNewStep(stepText: string, mediaType?: string) {
    this.reset();
    this.title = stepText;
    this.docStringType = mediaType;
  }

  setInfo(info: TestStepInfo) {
    this.origInfo = info;
  }

  setError(error: unknown) {
    // Reserve undefined for steps without a failure.
    this.error = error === undefined ? 'undefined' : error;
  }

  reset() {
    this.title = '';
    this.docStringType = undefined;
    this.error = undefined;
    this.origInfo = undefined;
    this.skipped = undefined;
    this.isAfterStepPhase = false;
  }

  isSkipError(error: unknown) {
    return this.skipped !== undefined && error === this.skipped;
  }

  skip(): void;
  skip(condition: boolean, description?: string): void;
  skip(condition = true, description?: string) {
    const info = this.info;
    if (this.isAfterStepPhase) throw new Error('$step.skip() cannot be called in AfterStep hooks.');
    try {
      (info as TestStepInfo).skip(condition, description);
    } catch (error: unknown) {
      const e = error as Error;
      this.skipped = e;
      throw e;
    }
  }
}
