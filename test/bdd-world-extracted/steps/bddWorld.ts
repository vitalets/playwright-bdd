/**
 * Bdd world class used as built-in world before playwright-bdd v7.
 */

import { APIRequestContext, Browser, BrowserContext, Page, TestInfo } from '@playwright/test';

export type BddWorldOptions<TestType> = {
  test: TestType;
  page: Page;
  context: BrowserContext;
  browser: Browser;
  browserName: string;
  request: APIRequestContext;
  testInfo: TestInfo;
  tags: string[];
  step: { title: string };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class BddWorld<TestType = any> {
  constructor(public options: BddWorldOptions<TestType>) {}

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

  get testInfo() {
    return this.options.testInfo;
  }

  get tags() {
    return this.options.tags;
  }

  get test() {
    return this.options.test;
  }

  get step() {
    return this.options.step;
  }

  async init() {
    // async setup before each test
  }

  async destroy() {
    // async teardown after each test
  }
}
