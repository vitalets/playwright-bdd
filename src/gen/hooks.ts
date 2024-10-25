/**
 * Collect hooks for test file.
 */

import {
  GeneralScenarioHook,
  getScenarioHooksFixtureNames,
  getScenarioHooksToRun,
  ScenarioHookType,
} from '../hooks/scenario';
import { toBoolean } from '../utils';
import { Formatter } from './formatter';
import { TestNode } from './testNode';

export class Hooks {
  before = new TypedHooks('before', this.formatter);
  after = new TypedHooks('after', this.formatter);

  constructor(private formatter: Formatter) {}

  registerHooksForTest(node: TestNode) {
    this.before.registerHooksForTest(node);
    this.after.registerHooksForTest(node);
  }

  getCustomTests() {
    return new Set([
      ...this.before.getCustomTests(), // prettier-ignore
      ...this.after.getCustomTests(),
    ]);
  }

  getLines() {
    const lines = [
      ...this.before.getLines(), // prettier-ignore
      ...this.after.getLines(),
    ];
    if (lines.length) lines.push('');
    return lines;
  }
}

class TypedHooks<T extends ScenarioHookType> {
  hooks = new Set<GeneralScenarioHook>();

  constructor(
    private type: T,
    private formatter: Formatter,
  ) {}

  registerHooksForTest(node: TestNode) {
    if (node.isSkipped()) return;
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
