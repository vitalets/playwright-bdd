import {
  APIRequestContext,
  Browser,
  BrowserContext,
  Page,
  TestInfo,
} from '@playwright/test';
import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber';

// See: https://playwright.dev/docs/test-fixtures#built-in-fixtures
export type WorldOptions<ParametersType = any> =
  IWorldOptions<ParametersType> & {
    page: Page;
    context: BrowserContext;
    browser: Browser;
    browserName: string;
    request: APIRequestContext;
  };

export class World<ParametersType = any> extends CucumberWorld<ParametersType> {
  constructor(
    protected options: WorldOptions<ParametersType>,
    public testInfo: TestInfo
  ) {
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
