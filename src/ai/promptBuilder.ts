/**
 * Handles Fix With AI feature for Cucumber HTML Reporter.
 */

import { defaultPromptTemplate } from './promptTemplate';
import { Page } from '@playwright/test';
import { supportedFeatures } from '../playwright/supportedFeatures';
import { BddContext } from '../runtime/bddContext';
import { stripAnsiEscapes } from '../utils/stripAnsiEscapes';
import { substitute } from '../utils';
import { getCodeSnippet } from './snippet';

export class PromptBuilder {
  constructor(
    private bddContext: BddContext,
    private page: Page,
  ) {}

  private get customTemplate() {
    return this.bddContext.config.aiFix?.promptTemplate;
  }

  // eslint-disable-next-line visual/complexity
  async build() {
    const { error } = this.bddContext.testInfo;
    if (!error) return;

    const errorMessage = stripAnsiEscapes(error.message || '').trim();
    if (!errorMessage) return;

    const steps = this.buildStepsString();
    if (!steps) return;

    const ariaSnapshot = await this.captureAriaSnapshot();
    if (!ariaSnapshot) return;

    const snippet = getCodeSnippet(error);
    if (!snippet) return;

    return substitute(this.customTemplate || defaultPromptTemplate, {
      scenarioName: this.bddContext.testInfo.title,
      steps,
      error: errorMessage,
      snippet,
      ariaSnapshot,
    }).trim();
  }

  private async captureAriaSnapshot() {
    if (supportedFeatures.ariaSnapshots && this.page) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore PW < 1.49 don't have .ariaSnapshot()
        return await this.page.locator('html').ariaSnapshot();
      } catch {
        // Page can be already closed
        // See: https://github.com/vitalets/playwright-bdd/issues/308
        return '';
      }
    }
  }

  private buildStepsString() {
    return this.bddContext.bddTestData.steps
      .slice(0, this.bddContext.stepIndex + 1)
      .map((bddStep) => bddStep.textWithKeyword)
      .filter(Boolean)
      .map((line) => `  ${line}`)
      .join('\n');
  }
}
