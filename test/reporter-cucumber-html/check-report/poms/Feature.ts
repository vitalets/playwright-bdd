import { Locator, Page } from '@playwright/test';
import { Scenario } from './Scenario';
import path from 'node:path';

export class Feature {
  root: Locator;

  constructor(
    public page: Page,
    public featureUri: string,
  ) {
    const container = page
      .locator('[data-accordion-component="AccordionItem"]')
      .filter({ has: this.getFileHeader() });
    this.root = container.locator('[data-accordion-component="AccordionItemPanel"]');
  }

  getFileHeader() {
    return this.page.locator('[data-accordion-component="AccordionItemHeading"]', {
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
    return new Scenario(this, `Scenario:${title}`);
  }

  getScenarioOutline(title: string) {
    return new Scenario(this, `Scenario Outline:${title}`);
  }

  getTags() {
    return this.root.locator('> section > [aria-label="Tags"]').getByRole('listitem');
  }
}
