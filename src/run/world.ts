import {
  APIRequestContext,
  Browser,
  BrowserContext,
  Page,
  TestInfo,
} from '@playwright/test';
import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber';

// See: https://playwright.dev/docs/test-fixtures#built-in-fixtures
export type WorldOptions = IWorldOptions & {
  page: Page;
  context: BrowserContext;
  browser: Browser;
  browserName: string;
  request: APIRequestContext;
};

export class World extends CucumberWorld {
  constructor(protected options: WorldOptions, public testInfo: TestInfo) {
    super(options);
  }

  get page() {
    return this.options.page;
  }

  get context() {
    return this.options.context;
  }

  get browser() {
    return this.options.browser;
  }

  get browserName() {
    return this.options.browserName;
  }

  get request() {
    return this.options.request;
  }
}
