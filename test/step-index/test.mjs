import { rmSync } from 'node:fs';
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
    skipped: ['open :OtherWord', 'choose [CommonWord first/CommonWord second]'],
  });
  expectStepMatchCalls('open :OtherWord', {
    matched: ['open :OtherWord'],
    tried: ['^LongestWord$', 'abcdefghij{foo|bar}'],
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
  expectStepMatchCalls('choose CommonWord second', {
    matched: ['choose [CommonWord first/CommonWord second]'],
    tried: [],
    skipped: ['pick {SharedWord first/SharedWord second}'],
  });
  expectStepMatchCalls('pick SharedWord second', {
    matched: ['pick {SharedWord first/SharedWord second}'],
    tried: [],
    skipped: ['choose [CommonWord first/CommonWord second]', 'read LongestWord:body{DocString}'],
  });
  const fallbackMatch = {
    matched: ['use [PrimaryAction/SecondaryAction] (OptionalWord ):parameterName{word}'],
    tried: [],
    skipped: [],
  };
  expectStepMatchCalls('use PrimaryAction value', fallbackMatch);
  expectStepMatchCalls('use SecondaryAction value', fallbackMatch);
  expectStepMatchCalls('close OtherWord LongestWord', {
    matched: ['close OtherWord LongestWord'],
    tried: ['read LongestWord:body{DocString}'],
    skipped: ['choose [CommonWord first/CommonWord second]'],
  });
  expectStepMatchCalls('read LongestWord', {
    matched: ['read LongestWord:body{DocString}'],
    tried: ['close OtherWord LongestWord'],
    skipped: ['open :OtherWord'],
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

function expectStepMatchCalls(stepText, { matched, tried, skipped }) {
  const calls = JSON.parse(testDir.getFileContents(matchCallsFile));
  expectPatterns(matched, 'matched', { calls: 1, matches: 1 });
  expectPatterns(tried, 'tried', { calls: 1, matches: 0 });
  expectPatterns(skipped, 'skipped', undefined);

  function expectPatterns(patterns, outcome, counts) {
    patterns.forEach((pattern) => {
      expect(calls[stepText]?.[pattern], `${stepText} → ${pattern} (${outcome})`).toEqual(counts);
    });
  }
}
