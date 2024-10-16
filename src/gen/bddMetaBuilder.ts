/**
 * Class to build and print meta - an object containing meta info about each test.
 * Tests are identified by special key constructed from title path.
 *
 * Example:
 * const bddFileMeta = {
 *  "Simple scenario": { pickleLocation: "3:10", tags: ["@foo"], pickleSteps: ["Given step"] },
 *  "Scenario with examples|Example #1": { pickleLocation: "8:26", tags: [], pickleSteps: ["Given step"] },
 *  "Rule 1|Scenario with examples|Example #1": { pickleLocation: "9:42", tags: [], pickleSteps: ["Given step"] },
 * };
 */

import * as messages from '@cucumber/messages';
import { TestNode } from './testNode';
import { TestInfo } from '@playwright/test';
import { stringifyLocation } from '../utils';
import { GherkinDocumentQuery } from '../features/documentQuery';
import { indent } from './formatter';
import { PickleWithLocation } from '../features/types';

const TEST_KEY_SEPARATOR = '|';

export type BddFileMeta = Record<string /* test-key */, BddTestMeta>;

export type BddTestMeta = {
  pickleLocation: string;
  tags?: string[];
  ownTags?: string[];
  pickleSteps: string[]; // array of step titles with keyword (including bg steps)
};

type BddTestData = {
  pickle: PickleWithLocation;
  node: TestNode;
};

export class BddMetaBuilder {
  private tests: BddTestData[] = [];
  private pickleStepToScenarioStep = new Map<messages.PickleStep, messages.Step>();

  constructor(private gherkinDocumentQuery: GherkinDocumentQuery) {}

  get testCount() {
    return this.tests.length;
  }

  registerTest(node: TestNode, astNodeId: string) {
    const pickles = this.gherkinDocumentQuery.getPickles(astNodeId);
    if (pickles.length !== 1) {
      throw new Error(`Found ${pickles.length} pickle(s) for scenario: ${node.title}`);
    }
    this.tests.push({ node, pickle: pickles[0] });
  }

  registerStep(scenarioStep: messages.Step) {
    this.gherkinDocumentQuery.getPickleSteps(scenarioStep.id).forEach((pickleStep) => {
      // map each pickle step to scenario step to get full original step later
      this.pickleStepToScenarioStep.set(pickleStep, scenarioStep);
    });
  }

  getFixture() {
    return [`$bddFileMeta: ({}, use) => use(bddFileMeta),`];
  }

  getObject() {
    return [
      'const bddFileMeta = {', // prettier-ignore
      ...this.buildObjectLines().map(indent),
      '};',
    ];
  }

  private buildObjectLines() {
    return this.tests.map(({ node, pickle }) => {
      // build object line by line to have each test on a separate line,
      // but value should be in one line.
      const testKey = this.buildTestKey(node);
      const testMeta = this.buildTestMeta({ node, pickle });
      return `${JSON.stringify(testKey)}: ${JSON.stringify(testMeta)},`;
    });
  }

  private buildTestKey(node: TestNode) {
    // .slice(1) -> b/c we remove top describe title (it's same for all tests)
    return node.titlePath.slice(1).join(TEST_KEY_SEPARATOR);
  }

  private buildTestMeta({ node, pickle }: BddTestData): BddTestMeta {
    return {
      pickleLocation: stringifyLocation(pickle.location),
      tags: node.tags.length ? node.tags : undefined,
      // todo: avoid duplication of tags and ownTags
      ownTags: node.ownTags.length ? node.ownTags : undefined,
      pickleSteps: pickle.steps.map((pickleStep) => this.buildStepTitleWithKeyword(pickleStep)),
    };
  }

  private buildStepTitleWithKeyword(pickleStep: messages.PickleStep) {
    const scenarioStep = this.pickleStepToScenarioStep.get(pickleStep);
    // scenario step are undefined for skipped scenarios,
    // but we still fill pickleSteps for consistency.
    const keyword = scenarioStep?.keyword || '';
    // There is no full original step text in gherkin document.
    // Build it by concatenation of keyword and text.
    // Cucumber html-formatter does the same.
    // See: https://github.com/cucumber/react-components/blob/27b02543a5d7abeded3410a58588ee4b493b4a8f/src/components/gherkin/GherkinStep.tsx#L114
    return `${keyword}${pickleStep.text}`;
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
