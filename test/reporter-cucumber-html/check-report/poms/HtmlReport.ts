import { Page } from '@playwright/test';
import { Feature } from './Feature';

export class HtmlReport {
  constructor(public page: Page) {}

  getFeature(featureUri: string) {
    return new Feature(this.page, featureUri);
  }
}
