/**
 * Collect hooks for test file.
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
import { TestNode } from './testNode';

export class TestFileHooks {
  private beforeAll = new TestFileWorkerHooks('beforeAll', this.formatter);
  private afterAll = new TestFileWorkerHooks('afterAll', this.formatter);
  private before = new TestFileScenarioHooks('before', this.formatter);
  private after = new TestFileScenarioHooks('after', this.formatter);

  constructor(private formatter: Formatter) {}

  registerHooksForTest(node: TestNode) {
    if (node.isSkipped()) return;
    this.beforeAll.registerHooksForTest(node);
    this.afterAll.registerHooksForTest(node);
    this.before.registerHooksForTest(node);
    this.after.registerHooksForTest(node);
  }

  getCustomTests() {
    return new Set([
      ...this.beforeAll.getCustomTests(), // prettier-ignore
      ...this.afterAll.getCustomTests(),
      ...this.before.getCustomTests(),
      ...this.after.getCustomTests(),
    ]);
  }

  getLines() {
    const lines = [
      ...this.beforeAll.getLines(), // prettier-ignore
      ...this.afterAll.getLines(),
      ...this.before.getLines(),
      ...this.after.getLines(),
    ];
    if (lines.length) lines.push('');
    return lines;
  }
}

class TestFileScenarioHooks<T extends ScenarioHookType> {
  hooks = new Set<GeneralScenarioHook>();

  constructor(
    private type: T,
    private formatter: Formatter,
  ) {}

  registerHooksForTest(node: TestNode) {
    getScenarioHooksToRun(this.type, node.tags).forEach((hook) => this.hooks.add(hook));
  }

  getCustomTests() {
    return new Set([...this.hooks].map((hook) => hook.customTest).filter(toBoolean));
  }

  getLines() {
    if (!this.hooks.size) return [];
    const fixtureNames = getScenarioHooksFixtureNames([...this.hooks]);
    return this.formatter.scenarioHooksCall(this.type, fixtureNames);
  }
}

class TestFileWorkerHooks<T extends WorkerHookType> {
  hooks = new Set<WorkerHook>();

  constructor(
    private type: T,
    private formatter: Formatter,
  ) {}

  // todo: node is not used until we add tags to worker hooks
  registerHooksForTest(_node: TestNode) {
    getWorkerHooksToRun(this.type).forEach((hook) => this.hooks.add(hook));
  }

  getCustomTests() {
    return new Set([...this.hooks].map((hook) => hook.customTest).filter(toBoolean));
  }

  getLines() {
    if (!this.hooks.size) return [];
    const fixtureNames = getWorkerHooksFixtureNames([...this.hooks]);
    return this.formatter.workerHooksCall(this.type, fixtureNames);
  }
}
