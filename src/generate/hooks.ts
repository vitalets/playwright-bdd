/**
 * Manage hooks for test file.
 *
 * For worker hooks we generate test.beforeAll() / test.afterAll() that call $runWorkerFixture
 * and pass all needed fixtures to it.
 *
 * For scenario hooks we generate test.beforeEach() / test.afterEach()
 * that just reference $beforeEach/$afterEach fixtures,
 * to get them executed during fixtures setup and call scenario hooks.
 * Additionally, we generate all scenario-hooks used fixtures in $beforeEachFixtures/$afterEachFixtures.
 * The approach is different for beforeAll/afterAll.
 * If we follow the same approach and call scenario hooks directly inside test.beforeEach,
 * them in case of error in hook, Playwright will execute Background steps.
 * See: https://github.com/microsoft/playwright/issues/33314
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
    return this.formatter.scenarioHooksCall(this.type);
  }

  getFixtureNames() {
    return getScenarioHooksFixtureNames([...this.hooks]);
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
