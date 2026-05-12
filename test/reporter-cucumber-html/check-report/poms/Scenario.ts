import { Locator } from '@playwright/test';
import { Feature } from './Feature';

/**
 * POM for scenario, scenario outline, and background
 */
export class Scenario {
  root: Locator;
  header: Locator;

  constructor(
    public feature: Feature,
    public titleWithKeyword: string,
  ) {
    // important to use this.page here, not feature.root
    this.header = this.page.getByRole('heading', { name: titleWithKeyword, level: 2 });
    this.root = feature.root
      .locator('section')
      // filter out top section
      .filter({ hasNot: this.page.getByRole('heading', { level: 1 }) })
      .filter({ has: this.header });
  }

  get page() {
    return this.feature.page;
  }

  getSteps(status: 'all' | 'failed' | 'passed' | 'skipped' = 'all') {
    const steps = this.root.locator('article ol > li');
    return status === 'all'
      ? steps
      : this.root.locator(`article ol > li[data-status="${status.toUpperCase()}"]`);
  }

  getStepTitles(status: 'all' | 'failed' | 'passed' | 'skipped' = 'all') {
    return this.getSteps(status).getByRole('heading', { level: 3 });
  }

  getStep(title: string | RegExp, status: 'all' | 'failed' | 'passed' | 'skipped' = 'all') {
    return this.getSteps(status).filter({
      has: this.page.getByRole('heading', {
        level: 3,
        name: title,
      }),
    });
  }

  async expandHooks(_type: 'before' | 'after') {
    // The report has a single button per scenario that expands all hooks together,
    // so _type is not used for targeting but documents the caller's intent.
    await this.root.locator('article > button').click();
  }

  async expandAttachment() {
    await this.root.locator('article > button').click();
  }

  getAttachments() {
    return this.getSteps().locator('> :nth-child(2) li:has(details)');
  }

  getTraceLinks() {
    return this.root.getByRole('button', { name: 'Download trace' });
  }

  getLogs() {
    // Log attachments in the new reporter are 'div > pre' inside ol > li (no 'details' wrapper).
    return this.getSteps().locator('> :nth-child(2) ol > li > div > pre');
  }

  getErrors() {
    // Error section is a direct 'div > pre' child of the step content area (:nth-child(2)).
    // In the new reporter, only the callstack is shown for assertion/fixture errors;
    // timeout errors show '<strong>Error</strong>' + message text.
    return this.getSteps().locator('> :nth-child(2) > div > pre');
  }

  getTags() {
    return this.root.locator('[aria-label="Tags"]').getByRole('listitem');
  }

  getDataTable() {
    return this.root.getByRole('table');
  }

  getDocString() {
    // todo: distinguish from error
    return this.root.locator('div > pre');
  }

  getExamples() {
    return this.root.locator('section');
  }
}
