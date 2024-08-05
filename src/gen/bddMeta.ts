/**
 * Class to build and print testMeta object containing meta info about each test.
 * Tests are identified by special key constructed from title path.
 *
 * Example:
 * const bddMetaMap = {
 *  "Simple scenario": { pickleLocation: "3:10", tags: ["@foo"] },
 *  "Scenario with examples|Example #1": { pickleLocation: "8:26", tags: [] },
 *  "Rule 1|Scenario with examples|Example #1": { pickleLocation: "9:42", tags: [] },
 * };
 */

import { TestNode } from './testNode';
import { PickleWithLocation } from '../features/load';
import { TestInfo } from '@playwright/test';
import { stringifyLocation } from '../utils';

const TEST_KEY_SEPARATOR = '|';

export type BddFileMeta = Record<string /* test-key */, BddTestMeta>;

export type BddTestMeta = {
  pickleLocation: string;
  tags?: string[];
  ownTags?: string[];
};

export class BddFileMetaBuilder {
  private tests: { node: TestNode; bddTestMeta: BddTestMeta }[] = [];

  get testCount() {
    return this.tests.length;
  }

  registerTest(node: TestNode, pickle: PickleWithLocation) {
    const bddTestMeta: BddTestMeta = {
      pickleLocation: stringifyLocation(pickle.location),
      tags: node.tags.length ? node.tags : undefined,
      // todo: avoid duplication of tags and ownTags
      ownTags: node.ownTags.length ? node.ownTags : undefined,
    };
    this.tests.push({ node, bddTestMeta });
  }

  getObjectLines() {
    // build object line by line to have each test on a separate line,
    // but value should be in one line.
    return this.tests.map((test) => {
      const testKey = this.getTestKey(test.node);
      return `${JSON.stringify(testKey)}: ${JSON.stringify(test.bddTestMeta)},`;
    });
  }

  private getTestKey(node: TestNode) {
    // .slice(1) -> b/c we remove top describe title (it's same for all tests)
    return node.titlePath.slice(1).join(TEST_KEY_SEPARATOR);
  }
}

export function getBddTestMeta(
  bddFileMeta: BddFileMeta,
  testInfo: TestInfo,
): BddTestMeta | undefined {
  // .slice(2) -> b/c we remove filename and top describe title
  const key = testInfo.titlePath.slice(2).join(TEST_KEY_SEPARATOR);
  return bddFileMeta[key];
  // Before we throw if key not found in testMetaMap.
  // Now we just return undefined, b/c testMetaMap is empty for non-bdd projects.
  // It is easier than checking is current project BDD or non-BDD.
  // Although we can swallow some errors.
  // See: https://github.com/vitalets/playwright-bdd/issues/189
}
