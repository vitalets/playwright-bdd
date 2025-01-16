/**
 * Handles page's aria snapshot, stored in annotation.
 */
import { Page, TestInfo } from '@playwright/test';
import * as pw from '@playwright/test/reporter';

const ANNOTATION_NAME = '_ariaSnapshot';

export class PageAriaSnapshot {
  private page?: Page;

  constructor(private testInfo: TestInfo) {}

  setPage(page: Page) {
    this.page = page;
  }

  async captureOnFail() {
    if (this.page && this.isFailedTest()) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore PW < 1.49 don't have .ariaSnapshot()
      const ariaSnapshot = await this.page.locator('html').ariaSnapshot();
      this.testInfo.annotations.push({ type: ANNOTATION_NAME, description: ariaSnapshot });
    }
  }

  private isFailedTest() {
    const { testInfo } = this;
    const willBeRetried = testInfo.retry < testInfo.project.retries;
    return Boolean(testInfo.error && !willBeRetried);
  }
}

export function extractAriaSnapshot(test: pw.TestCase) {
  return test.annotations.find((a) => a.type === ANNOTATION_NAME)?.description;
}
