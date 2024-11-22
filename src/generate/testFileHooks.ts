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
import { toBoolean } from '../utils';
import { Formatter } from './formatter';
import { TestGen } from './test/test';

export class TestFileHooks {
  private beforeAll = new TestFileWorkerHooks('beforeAll', this.formatter);
  private afterAll = new TestFileWorkerHooks('afterAll', this.formatter);
  public before = new TestFileScenarioHooks('before', this.formatter);
  public after = new TestFileScenarioHooks('after', this.formatter);

  constructor(private formatter: Formatter) {}

  fillFromTests(tests: TestGen[]) {
    tests.forEach((test) => {
      this.beforeAll.registerHooksForTest(test.tags);
      this.afterAll.registerHooksForTest(test.tags);
      this.before.registerHooksForTest(test.tags);
      this.after.registerHooksForTest(test.tags);
    });
  }

  getCustomTests() {
    return new Set([
      ...this.beforeAll.getCustomTests(), // prettier-ignore
      ...this.afterAll.getCustomTests(),
      ...this.before.getCustomTests(),
      ...this.after.getCustomTests(),
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

class TestFileScenarioHooks<T extends ScenarioHookType> {
  private hooks = new Set<GeneralScenarioHook>();

  constructor(
    private type: T,
    private formatter: Formatter,
  ) {}

  registerHooksForTest(testTags: string[]) {
    getScenarioHooksToRun(this.type, testTags).forEach((hook) => this.hooks.add(hook));
  }

  getCustomTests() {
    return new Set([...this.hooks].map((hook) => hook.customTest).filter(toBoolean));
  }

  render() {
    if (!this.hooks.size) return [];
    return this.formatter.scenarioHooksCall(this.type);
  }

  getFixtureNames() {
    return getScenarioHooksFixtureNames([...this.hooks]);
  }
}

class TestFileWorkerHooks<T extends WorkerHookType> {
  private hooks = new Set<WorkerHook>();

  constructor(
    private type: T,
    private formatter: Formatter,
  ) {}

  // todo: _testTags is not used until we add tags to worker hooks
  registerHooksForTest(_testTags: string[]) {
    getWorkerHooksToRun(this.type).forEach((hook) => this.hooks.add(hook));
  }

  getCustomTests() {
    return new Set([...this.hooks].map((hook) => hook.customTest).filter(toBoolean));
  }

  render() {
    if (!this.hooks.size) return [];
    const fixtureNames = getWorkerHooksFixtureNames([...this.hooks]);
    return this.formatter.workerHooksCall(this.type, new Set(fixtureNames));
  }
}
