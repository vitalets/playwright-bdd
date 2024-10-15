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
import { TestInfo } from '@playwright/test';
import { stringifyLocation } from '../utils';
import { GherkinDocumentQuery } from '../features/documentQuery';
import { RenderedTest } from './testFile';
import { indent } from './formatter';
import { PickleWithLocation } from '../features/load';

const TEST_KEY_SEPARATOR = '|';

export type BddFileMeta = Record<string /* test-key */, BddTestMeta>;

export type BddTestMeta = {
  pickleLocation: string;
  tags?: string[];
  ownTags?: string[];
  pickleSteps?: string[]; // array of step titles with keyword (including bg steps)
};

export class BddFileMetaBuilder {
  constructor(private gherkinDocumentQuery: GherkinDocumentQuery) {}

  formatFixture() {
    return [`$bddFileMeta: ({}, use) => use(bddFileMeta),`];
  }

  formatObject(tests: RenderedTest[]) {
    return [
      'const bddFileMeta = {', // prettier-ignore
      ...tests.map((test) => this.buildObjectLine(test)).map(indent),
      '};',
    ];
  }

  private buildObjectLine({ node, pickle }: RenderedTest) {
    // build object line by line to have each test on a separate line,
    // but value should be in one line.
    const testKey = this.buildTestKey(node);
    const testMeta = this.buildTestMeta({ node, pickle });
    return `${JSON.stringify(testKey)}: ${JSON.stringify(testMeta)},`;
  }

  private buildTestKey(node: TestNode) {
    // .slice(1) -> b/c we remove top describe title (it's same for all tests)
    return node.titlePath.slice(1).join(TEST_KEY_SEPARATOR);
  }

  private buildTestMeta({ node, pickle }: RenderedTest): BddTestMeta {
    return {
      pickleLocation: stringifyLocation(pickle.location),
      tags: node.tags.length ? node.tags : undefined,
      // todo: avoid duplication of tags and ownTags
      ownTags: node.ownTags.length ? node.ownTags : undefined,
      pickleSteps: this.buildTestMetaSteps(pickle),
    };
  }

  private buildTestMetaSteps(pickle: PickleWithLocation) {
    return pickle.steps.map((pickleStep) => {
      // const scenarioStep = this.gherkinDocumentQuery.getScenarioStep(pickleStep);
      // There is no full original text for steps.
      // Cucumber html-formatter concatenates keyword and text, we do the same.
      // return `${scenarioStep.keyword}${pickleStep.text}`;
      return `${pickleStep.text}`;
    });
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
