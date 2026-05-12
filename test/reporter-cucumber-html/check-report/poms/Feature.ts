import { expect, Locator, Page } from '@playwright/test';
import { Scenario } from './Scenario';
import path from 'node:path';

export class Feature {
  root: Locator;

  constructor(
    public page: Page,
    public featureUri: string,
  ) {
    // Parent of the h3 heading is the disclosure container, which also holds the panel
    const container = this.getFileHeader().locator('..');
    this.root = container.locator('[role="group"]');
  }

  async ensureExpanded() {
    await expect(this.getFileHeader()).toBeVisible();
    // Use aria-expanded since hidden='until-found' panels have display:block,
    // making isHidden() return false even when the panel is collapsed
    const button = this.getFileHeader().getByRole('button');
    if ((await button.getAttribute('aria-expanded')) !== 'true') {
      await button.click();
    }
  }

  getFileHeader() {
    return this.page.getByRole('heading', { level: 3 }).filter({
      hasText: path.normalize(this.featureUri),
    });
  }

  getFeatureHeader() {
    return this.root.getByRole('heading', { level: 1 });
  }

  getBackground() {
    return new Scenario(this, `Background:`);
  }

  getScenario(title: string) {
    return new Scenario(this, `Scenario: ${title}`);
  }

  getScenarioOutline(title: string) {
    return new Scenario(this, `Scenario Outline: ${title}`);
  }

  getTags() {
    return this.root.locator('> div > section > [aria-label="Tags"]').getByRole('listitem');
  }
}
