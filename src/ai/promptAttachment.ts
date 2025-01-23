/**
 * Handles prompt attachment for AI fixing of tests.
 */
import { Page } from '@playwright/test';
import { BddContext } from '../runtime/bddContext';
import { PromptBuilder } from './promptBuilder';

const PROMPT_ATTACHMENT_NAME = '🤖 Fix with AI: copy prompt and paste to AI chat';
const PROMPT_ATTACHMENT_CONTENT_TYPE = 'text/plain+prompt';

export class PromptFixture {
  private page?: Page;

  constructor(private bddContext: BddContext) {}

  private get bddConfig() {
    return this.bddContext.config;
  }

  private get testInfo() {
    return this.bddContext.testInfo;
  }

  setPage(page: Page) {
    this.page = page;
  }

  async attach() {
    if (!this.bddConfig.aiFix?.promptAttachment) return;
    if (!this.page) return;
    if (!this.isFailedTest()) return;

    const prompt = await new PromptBuilder(this.bddContext, this.page).build();
    if (!prompt) return;

    await this.testInfo.attach(this.getAttachmentName(), {
      body: prompt,
      contentType: PROMPT_ATTACHMENT_CONTENT_TYPE,
    });
  }

  private isFailedTest() {
    const { testInfo } = this;
    const willBeRetried = testInfo.retry < testInfo.project.retries;
    return Boolean(testInfo.error && !willBeRetried);
  }

  private getAttachmentName() {
    return this.bddConfig.aiFix?.promptAttachmentName || PROMPT_ATTACHMENT_NAME;
  }
}

export function isPromptAttachmentContentType(contentType: string) {
  return contentType === PROMPT_ATTACHMENT_CONTENT_TYPE;
}
