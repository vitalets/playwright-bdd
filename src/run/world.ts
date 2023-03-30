import {
  APIRequestContext,
  Browser,
  BrowserContext,
  Page,
} from '@playwright/test';

// See: https://playwright.dev/docs/test-fixtures#built-in-fixtures
export type WorldOptions = {
  page: Page;
  context: BrowserContext;
  browser: Browser;
  browserName: string;
  request: APIRequestContext;
};

// todo: inherit from cucumber's World?
export class World {
  constructor(private options: WorldOptions) {}

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
