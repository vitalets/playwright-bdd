import { APIRequestContext, Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';

// See: https://playwright.dev/docs/test-fixtures#built-in-fixtures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WorldOptions<ParametersType = any> = IWorldOptions<ParametersType> & {
  page: Page;
  context: BrowserContext;
  browser: Browser;
  browserName: string;
  request: APIRequestContext;
  testInfo: TestInfo;
  supportCodeLibrary: ISupportCodeLibrary;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class World<ParametersType = any> extends CucumberWorld<ParametersType> {
  // todo: hide with Symbol
  customFixtures: unknown;

  constructor(public options: WorldOptions<ParametersType>) {
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

  get testInfo() {
    return this.options.testInfo;
  }

  async init() {
    // async setup before each test
  }

  async destroy() {
    // async teardown after each test
  }
}

export function getWorldConstructor(supportCodeLibrary: ISupportCodeLibrary) {
  // setWorldConstructor was not called
  if (supportCodeLibrary.World === CucumberWorld) {
    return World;
  }
  if (!Object.prototype.isPrototypeOf.call(World, supportCodeLibrary.World)) {
    throw new Error(`CustomWorld should inherit from playwright-bdd World`);
  }
  return supportCodeLibrary.World as typeof World;
}
