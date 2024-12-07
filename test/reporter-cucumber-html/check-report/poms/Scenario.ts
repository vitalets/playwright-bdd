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
    const steps = this.root.locator('[aria-label="Steps"]').getByRole('listitem');
    return status === 'all'
      ? steps
      : steps.filter({
          has: this.page.locator(`[data-status="${status.toUpperCase()}"]`),
        });
  }

  getAttachments() {
    return this.root.locator('details');
  }

  getLogs() {
    return this.root.locator('div > pre').filter({
      hasNot: this.getErrors(),
    });
  }

  getErrors() {
    return this.getSteps()
      .locator('div > pre')
      .filter({
        hasText: /error|timeout|expected|browser .*?closed/i,
      });
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
