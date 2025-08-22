/**
 * Manage hooks for test file.
 *
 * For worker hooks we generate test.beforeAll() / test.afterAll() that call $runWorkerFixture
 * and pass all needed fixtures to it.
 *
 * For scenario hooks we generate test.beforeEach() / test.afterEach()
 * that call $runScenarioHooks and pass all needed fixtures to it.
 *
 * test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, fixtureA, fixtureB }) => {
 *   return $runScenarioHooks('before', { fixtureA, fixtureB }));
 * });
 * test.afterEach('AfterEach Hooks', ({ $runScenarioHooks, fixtureC }) => {
 *   return $runScenarioHooks('after', { fixtureC });
 * });
 *
 * It's important to generate these test.beforeEach() / test.afterEach() separately from Background,
 * otherwise dependency fixtures will be nested under background in the report.
 *
 * Additionally, we generate test.use() code for $beforeEachFixtures/$afterEachFixtures,
 * that collect all custom fixtures used in scenario hooks in this file.
 *
 * PREVIOUSLY:
 * For scenario hooks we generate test.beforeEach() / test.afterEach()
 * that just reference $beforeEach/$afterEach fixtures,
 * to get them executed during fixtures setup and call scenario hooks:
 *
 * test.beforeEach('BeforeEach Hooks', ({ $beforeEach }) => {});
 * test.afterEach('AfterEach Hooks', ({ $afterEach }) => {});
 *
 * The approach is different for beforeAll/afterAll.
 * If we follow the same approach and call scenario hooks directly inside test.beforeEach,
 * them in case of error in hook, Playwright will execute Background steps.
 * See: https://github.com/microsoft/playwright/issues/33314
 *
 * We can solve it by checking testInfo.error in Background's beforeEach, and calling testInfo.skip() in case of error.
 * But in this case in the Playwright report Background's beforeEach is still displayed and marked as failed:
 * test.beforeEach('Background', async ({}, testInfo) => {
 *   if (testInfo.error) testInfo.skip();
 *   // ... bg steps
 * });
 *
 * Another option is to wrap whole Background code into if (!testInfo.error) { ... },
 * but in this case Background is also displayed in the report as passed,
 * although actually it was not executed.
 *
 */

import { BddDataRenderer } from '../bddData/renderer';
import {
  GeneralScenarioHook,
  getScenarioHooksFixtureNames,
  getScenarioHooksToRun,
  ScenarioHookType,
} from '../hooks/scenario';
import {
  getWorkerHooksFixtureNames,
  getWorkerHooksToRun,
  WorkerHook,
  WorkerHookType,
} from '../hooks/worker';
import { areSetsEqual, toBoolean } from '../utils';
import { exit } from '../utils/exit';
import { Formatter } from './formatter';
import { TestGen } from './test';

export class TestFileHooks {
  private beforeAll = new WorkerHooks('beforeAll', this.formatter);
  private afterAll = new WorkerHooks('afterAll', this.formatter);
  public before = new ScenarioHooks('before', this.formatter);
  public after = new ScenarioHooks('after', this.formatter);

  constructor(private formatter: Formatter) {}

  fillFromTests(tests: TestGen[]) {
    tests
      .filter((test) => !test.skipped)
      .forEach((test) => {
        this.beforeAll.registerHooksForTest(test);
        this.afterAll.registerHooksForTest(test);
        // Important to generate calls of test.beforeEach() / test.afterEach()
        // that reference $beforeEach/$afterEach fixtures.
        // This forces $beforeEach/$afterEach to be initialized before the background.
        // Otherwise, Before/After hooks are called during background initialization
        // and in the report results are placed inside Background parent.
        this.before.registerHooksForTest(test);
        this.after.registerHooksForTest(test);
      });
  }

  getCustomTestInstances() {
    return new Set([
      ...this.beforeAll.getCustomTestInstances(), // prettier-ignore
      ...this.afterAll.getCustomTestInstances(),
      ...this.before.getCustomTestInstances(),
      ...this.after.getCustomTestInstances(),
    ]);
  }

  getWorldFixtureNames() {
    return new Set([
      ...this.before.getWorldFixtureNames(), // prettier-ignore
      ...this.after.getWorldFixtureNames(),
    ]);
  }

  render() {
    const lines = [
      ...this.beforeAll.render(), // prettier-ignore
      ...this.afterAll.render(),
      ...this.before.render(),
      ...this.after.render(),
    ];
    if (lines.length) lines.push('');
    return lines;
  }
}

class ScenarioHooks<T extends ScenarioHookType> {
  private hooks = new Set<GeneralScenarioHook>();

  constructor(
    private type: T,
    private formatter: Formatter,
  ) {}

  registerHooksForTest(test: TestGen) {
    getScenarioHooksToRun(this.type, test.tags).forEach((hook) => this.hooks.add(hook));
  }

  getCustomTestInstances() {
    return new Set([...this.hooks].map((hook) => hook.customTest).filter(toBoolean));
  }

  render() {
    if (!this.hooks.size) return [];
    const fixtureNames = getScenarioHooksFixtureNames([...this.hooks]);
    return this.formatter.scenarioHooksCall(this.type, new Set(fixtureNames));
  }

  getWorldFixtureNames() {
    return new Set([...this.hooks].map((hook) => hook.worldFixture).filter(toBoolean));
  }
}

class WorkerHooks<T extends WorkerHookType> {
  private hooks = new Set<WorkerHook>();
  private tests: TestGen[] = [];

  constructor(
    private type: T,
    private formatter: Formatter,
  ) {}

  registerHooksForTest(test: TestGen) {
    /**
     * For worker hooks (beforeAll, afterAll) we require
     * that each test match exactly the same set of hooks.
     * Otherwise, in fully-parallel mode, we will run all worker hooks
     * in each worker for each test, that actually makes test-level tags useless.
     */
    const hooksForTest = new Set(getWorkerHooksToRun(this.type, test.tags));
    if (this.tests.length === 0) {
      this.hooks = hooksForTest;
    } else {
      this.ensureHooksEqual(test, hooksForTest);
    }
    this.tests.push(test);
  }

  getCustomTestInstances() {
    return new Set([...this.hooks].map((hook) => hook.customTest).filter(toBoolean));
  }

  render() {
    if (!this.hooks.size) return [];
    const fixtureNames = getWorkerHooksFixtureNames([...this.hooks]);
    return this.formatter.workerHooksCall(
      this.type,
      new Set(fixtureNames),
      BddDataRenderer.varName,
    );
  }

  private ensureHooksEqual(test: TestGen, hooksForTest: Set<WorkerHook>) {
    if (areSetsEqual(this.hooks, hooksForTest)) return;
    const prevTest = this.tests.at(-1)!;
    exit(
      [
        `Tagged ${this.type} hooks can use only feature-level tags.`,
        `Feature: ${test.featureUri}`,
        `  - ${this.hooks.size} hook(s): ${prevTest.testTitle} ${prevTest.tags.join(' ')}`,
        `  - ${hooksForTest.size} hook(s): ${test.testTitle} ${test.tags.join(' ')}`,
      ].join('\n'),
    );
  }
}
