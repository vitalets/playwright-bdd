/**
 * Class to build and print testMeta object containing meta info about each test.
 * Tests are identified by special key constructed from title path.
 *
 * Example:
 * const testMeta = {
 *  "Simple scenario": { pickleLocation: "3:10", tags: ["@foo"] },
 *  "Scenario with examples|Example #1": { pickleLocation: "8:26", tags: [] },
 *  "Rule 1|Scenario with examples|Example #1": { pickleLocation: "9:42", tags: [] },
 * };
 */

import { TestNode } from './testNode';
import { PickleWithLocation } from '../cucumber/loadFeatures';
import { TestInfo } from '@playwright/test';
import { stringifyLocation } from '../utils';

const TEST_KEY_SEPARATOR = '|';

export type TestMetaMap = Record<string, TestMeta>;

export type TestMeta = {
  pickleLocation: string;
  tags?: string[];
  ownTags?: string[];
};

export class TestMetaBuilder {
  private tests: { node: TestNode; testMeta: TestMeta }[] = [];

  get testCount() {
    return this.tests.length;
  }

  registerTest(node: TestNode, pickle: PickleWithLocation) {
    const testMeta: TestMeta = {
      pickleLocation: stringifyLocation(pickle.location),
      tags: node.tags.length ? node.tags : undefined,
      // todo: avoid duplication of tags and ownTags
      ownTags: node.ownTags.length ? node.ownTags : undefined,
    };
    this.tests.push({ node, testMeta });
  }

  getObjectLines() {
    // build object line by line to have each test on a separate line,
    // but value should be in one line.
    return this.tests.map((test) => {
      const testKey = this.getTestKey(test.node);
      return `${JSON.stringify(testKey)}: ${JSON.stringify(test.testMeta)},`;
    });
  }

  private getTestKey(node: TestNode) {
    // .slice(1) -> b/c we remove top describe title (it's same for all tests)
    return node.titlePath.slice(1).join(TEST_KEY_SEPARATOR);
  }
}

export function getTestMeta(testMetaMap: TestMetaMap, testInfo: TestInfo) {
  // .slice(2) -> b/c we remove filename and top describe title
  const key = testInfo.titlePath.slice(2).join(TEST_KEY_SEPARATOR);
  const testMeta = testMetaMap[key];
  if (!testMeta) throw new Error(`Can't find testMeta for key "${key}"`);
  return testMeta;
}
