import { rmSync } from 'node:fs';
import { CucumberExpression, ParameterTypeRegistry } from '@cucumber/cucumber-expressions';
import { requiredLiterals } from '../../dist/steps/stepIndex/requiredLiterals.js';
import {
  BDDGEN_CMD,
  execPlaywrightTest,
  execPlaywrightTestWithError,
  expect,
  expectCalls,
  test,
  TestDir,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);
const matchCallsFile = testDir.getAbsPath('actual-reports/match-calls.json');

test.beforeEach(() => rmSync(matchCallsFile, { force: true }));

test(`${testDir.name}: selects step candidates by longest word`, () => {
  execPlaywrightTest(testDir.name, {
    cmd: BDDGEN_CMD,
    env: {
      FEATURES: 'features/indexed-step-search/indexed-step-search.feature',
      STEPS: 'features/indexed-step-search/steps.ts',
    },
  });
  expectStepMatchCalls('open LongestWord', {
    matched: ['open LongestWord'],
    tried: [
      'close OtherWord LongestWord',
      'use LongestWord via PrimaryAction/SecondaryAction',
      '^LongestWord$',
      'abcdefghij{foo|bar}',
      'read LongestWord:body{DocString}',
    ],
    skipped: ['open :OtherWord'],
  });
  expectStepMatchCalls('open :OtherWord', {
    matched: ['open :OtherWord'],
    tried: ['^LongestWord$', 'abcdefghij{foo|bar}', 'read LongestWord:body{DocString}'],
    skipped: [
      'open LongestWord',
      'close OtherWord LongestWord',
      'use LongestWord via PrimaryAction/SecondaryAction',
    ],
  });
  expectStepMatchCalls('longestword', {
    matched: ['^LongestWord$'],
    tried: ['abcdefghij{foo|bar}'],
    skipped: ['open LongestWord'],
  });
  expectStepMatchCalls('bar}', {
    matched: ['abcdefghij{foo|bar}'],
    tried: ['^LongestWord$'],
    skipped: ['open LongestWord'],
  });
});

test(`${testDir.name}: reports steps without a matching definition`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    [
      'Missing step definitions: 2', // prettier-ignore
      "Given('I read the CatalogItem payload'",
      "Given('I wait'",
    ],
    { cmd: BDDGEN_CMD, env: { FEATURES: 'features/missing-steps.feature' } },
  );
});

test(`${testDir.name}: reports invalid Cucumber Expressions during generation`, () => {
  execPlaywrightTestWithError(
    testDir.name,
    ['broken step {noSuchType}', "Undefined parameter type 'noSuchType'"],
    {
      cmd: BDDGEN_CMD,
      env: {
        FEATURES: 'features/invalid-expression/invalid-expression.feature',
        STEPS: 'features/invalid-expression/steps.ts',
      },
    },
  );
});

test(`${testDir.name}: runs the matched steps with their captured arguments`, () => {
  const output = execPlaywrightTest(testDir.name, {
    env: { FEATURES: 'features/captured-arguments.feature' },
  });
  expectCalls('worker 0: ', output, [
    'CatalogItem field: Amount',
    'CatalogItem payload: first',
    'CatalogItem payload: second',
  ]);
});

test(`${testDir.name}: extracts only required literals from parsed Cucumber Expressions`, () => {
  expectRequiredLiterals('{string} requiredWord1 requiredWord2 left/right (optional)', [
    'requiredWord1',
    'requiredWord2',
  ]);
  expectRequiredLiterals('User opens :itemName', ['User', 'opens', ':itemName']);
  expectRequiredLiterals('prefix(a)/prefix(b)', ['prefix']);
  expectRequiredLiterals('{string} (optional)', []);
});

function expectStepMatchCalls(stepText, expected) {
  const calls = JSON.parse(testDir.getFileContents(matchCallsFile));
  const countsByOutcome = {
    matched: { calls: 1, matches: 1 },
    tried: { calls: 1, matches: 0 },
    skipped: undefined,
  };
  for (const [outcome, counts] of Object.entries(countsByOutcome)) {
    for (const pattern of expected[outcome]) {
      expect(calls[stepText]?.[pattern], `${stepText} → ${pattern} (${outcome})`).toEqual(counts);
    }
  }
}

function expectRequiredLiterals(expression, expected) {
  const parsed = new CucumberExpression(expression, new ParameterTypeRegistry());
  expect(requiredLiterals(parsed), expression).toEqual(expected);
}
