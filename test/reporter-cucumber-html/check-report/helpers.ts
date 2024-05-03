import { pathToFileURL } from 'node:url';
import { Locator, Page } from '@playwright/test';

export async function openReport(page: Page) {
  await page.goto(pathToFileURL('actual-reports/report.html').href);
}

export function getFeature(page: Page) {
  return new HtmlReport(page).getFeature('rich feature');
}

export function getScenario(page: Page, title: string) {
  return getFeature(page).getScenario(title);
}

export class HtmlReport {
  constructor(public page: Page) {}

  getFeature(title: string) {
    return new Feature(this.page, title);
  }
}

export class Feature {
  root: Locator;
  header: Locator;
  constructor(
    public page: Page,
    public title: string,
  ) {
    this.header = page.getByRole('heading', { name: title, level: 1 });
    this.root = page.locator('section').filter({ has: this.header });
  }

  getBackground() {
    return new Scenario(this, `Background:`);
  }

  getScenario(title: string) {
    return new Scenario(this, `Scenario:${title}`);
  }

  getScenarioOutline(title: string) {
    return new Scenario(this, `Scenario Outline:${title}`);
  }

  getTags() {
    return this.root.locator('> [aria-label="Tags"]').getByRole('listitem');
  }
}

export class Scenario {
  root: Locator;
  header: Locator;

  constructor(
    public feature: Feature,
    public title: string,
  ) {
    this.header = this.page.getByRole('heading', { name: title, exact: true });
    this.root = feature.root.locator('section').filter({ has: this.header });
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
