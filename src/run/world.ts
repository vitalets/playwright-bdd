import { APIRequestContext, Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { World as CucumberWorld, IWorldOptions, ITestCaseHookParameter } from '@cucumber/cucumber';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { PickleStep } from '@cucumber/messages';
import { findStepDefinition } from '../cucumber/loadSteps';
import { getLocationByStacktrace } from '../playwright/getLocationByStacktrace';
import { CucumberStepFunction } from './createBdd';
import { test as baseTest } from './baseTest';
import { getTestImpl } from '../playwright/testTypeImpl';

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
  $tags: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class World<ParametersType = any> extends CucumberWorld<ParametersType> {
  customFixtures: unknown;

  constructor(public options: WorldOptions<ParametersType>) {
    super(options);
    this.invokeStep = this.invokeStep.bind(this);
  }

  async invokeStep(text: string, argument?: unknown, customFixtures?: unknown) {
    const stepDefinition = findStepDefinition(
      this.options.supportCodeLibrary,
      text,
      this.testInfo.file,
    );
    const { parameters } = await stepDefinition.getInvocationParameters({
      hookParameter: {} as ITestCaseHookParameter,
      step: { text, argument } as PickleStep,
      world: this,
    });
    // get location of step call in generated test file
    const location = getLocationByStacktrace({ level: 2 });
    // attach custom fixtures to world - the only way to pass them to cucumber step fn
    this.customFixtures = customFixtures;
    const code = stepDefinition.code as CucumberStepFunction;
    const test = code.customTest || baseTest;
    const res = await getTestImpl(test)._step(location, text, () => code.apply(this, parameters));
    delete this.customFixtures;
    return res;
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

  get tags() {
    return this.options.$tags;
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
