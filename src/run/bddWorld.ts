import { APIRequestContext, Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { World as CucumberWorld, IWorldOptions, ITestCaseHookParameter } from '@cucumber/cucumber';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { PickleStep } from '@cucumber/messages';
import { findStepDefinition } from '../cucumber/loadSteps';
import { getLocationInFile } from '../playwright/getLocationInFile';
import { getTestImpl } from '../playwright/testTypeImpl';
import { TestTypeCommon } from '../playwright/types';
import { getStepCode } from '../stepDefinitions/defineStep';

// See: https://playwright.dev/docs/test-fixtures#built-in-fixtures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BddWorldOptions<ParametersType = any> = IWorldOptions<ParametersType> & {
  testInfo: TestInfo;
  supportCodeLibrary: ISupportCodeLibrary;
  $tags: string[];
  $test: TestTypeCommon;
};

type BuiltinFixtures = {
  page: Page;
  context: BrowserContext;
  browser: Browser;
  browserName: string;
  request: APIRequestContext;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class BddWorld<ParametersType = any> extends CucumberWorld<ParametersType> {
  builtinFixtures!: BuiltinFixtures;
  customFixtures: unknown;

  constructor(public options: BddWorldOptions<ParametersType>) {
    super(options);
    this.invokeStep = this.invokeStep.bind(this);
  }

  async invokeStep(text: string, argument?: unknown, customFixtures?: unknown) {
    const stepDefinition = findStepDefinition(
      this.options.supportCodeLibrary,
      text,
      this.testInfo.file,
    );

    if (!stepDefinition) {
      throw new Error(`Undefined step: "${text}"`);
    }

    // attach custom fixtures to world - the only way to pass them to cucumber step fn
    this.customFixtures = customFixtures;
    const code = getStepCode(stepDefinition);

    // get location of step call in generated test file
    const location = getLocationInFile(this.test.info().file);

    const { parameters } = await stepDefinition.getInvocationParameters({
      hookParameter: {} as ITestCaseHookParameter,
      step: { text, argument } as PickleStep,
      world: this,
    });

    const res = await getTestImpl(this.test)._step(location, text, () =>
      code.apply(this, parameters),
    );
    delete this.customFixtures;

    return res;
  }

  get page() {
    return this.builtinFixtures.page;
  }

  get context() {
    return this.builtinFixtures.context;
  }

  get browser() {
    return this.builtinFixtures.browser;
  }

  get browserName() {
    return this.builtinFixtures.browserName;
  }

  get request() {
    return this.builtinFixtures.request;
  }

  get testInfo() {
    return this.options.testInfo;
  }

  get tags() {
    return this.options.$tags;
  }

  get test() {
    return this.options.$test;
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
    return BddWorld;
  }
  if (!Object.prototype.isPrototypeOf.call(BddWorld, supportCodeLibrary.World)) {
    throw new Error(`CustomWorld should inherit from playwright-bdd World`);
  }
  return supportCodeLibrary.World as typeof BddWorld;
}
