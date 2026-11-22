import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import { PickleStepType } from '@cucumber/messages';
import { TestDir } from '../_helpers/index.mjs';
import { DataTable } from '../../dist/cucumber/DataTable.js';
import { importBddExpressions } from '../../dist/steps/bddExpression/index.js';
import { StepDefinition } from '../../dist/steps/stepDefinition.js';
import { formatDuplicateStepsMessage, StepFinder } from '../../dist/steps/finder.js';
import { stepDefinitions } from '../../dist/steps/stepRegistry.js';

const testDir = new TestDir(import.meta);
const LOCATION = { file: testDir.getAbsPath('test.mjs'), line: 1 };
const NOOP = () => undefined;
const PANEL_PATTERN = 'User opens the {string} panel on the CatalogItem';
const LEDGER_PATTERN = 'User closes the Ledger panel';
const DOCSTRING_PATTERN = 'payload:body{DocString}';
const TABLE_PATTERN = 'payload:table{DataTable}';

describe(testDir.name, () => {
  let savedDefinitions;

  it('shares cached matches between scan and index', () => {
    for (const useStepIndex of [false, true]) {
      const step = { text: `User opens the "Cart ${useStepIndex}" panel on the CatalogItem` };
      const first = lookupWithCalls(step, useStepIndex);
      const second = lookupWithCalls(step, !useStepIndex);

      assert.ok(first.calls.length > 1);
      assert.deepEqual(second.calls, [first.matches[0].definition]);
      assert.deepEqual(second.matches[0].definition, first.matches[0].definition);
    }
  });

  it('shares a DataTable entry but matches the current table', async () => {
    assert.deepEqual(findDefinitions({ text: 'payload' }), []);
    for (const [name, expectedCalls] of [
      ['Alice', stepDefinitions.length],
      ['Bob', 1],
    ]) {
      const dataTable = new DataTable([['name'], [name]]);
      const lookup = lookupWithCalls({ text: 'payload', dataTable });
      await assertMatch(lookup, TABLE_PATTERN, dataTable, expectedCalls);
    }
  });

  it('shares a DocString entry and treats an empty doc string as present', async () => {
    for (const [docString, expectedCalls] of [
      ['', stepDefinitions.length],
      ['hello', 1],
    ]) {
      const lookup = lookupWithCalls({ text: 'payload', docString });
      await assertMatch(lookup, DOCSTRING_PATTERN, docString, expectedCalls);
    }
  });

  it('keeps step text resembling the block prefix distinct', async () => {
    const plain = lookupWithCalls({ text: 'true:false:xxx' });
    assert.equal(plain.matches[0].definition.pattern, 'true:false:xxx');

    const docString = 'hello';
    const withBlock = lookupWithCalls({ text: 'xxx', docString });
    await assertMatch(withBlock, 'xxx:body{DocString}', docString, stepDefinitions.length);
  });

  it('applies keywords and tags for each lookup', () => {
    const finder = new StepFinder({ matchKeywords: true });
    const step = { text: 'scoped step', keywordType: PickleStepType.CONTEXT };
    const [tagged] = finder.findDefinitions(step, ['@special']);
    const [untagged] = finder.findDefinitions(step, ['@ordinary']);
    const [outcome] = finder.findDefinitions({ ...step, keywordType: PickleStepType.OUTCOME }, [
      '@special',
    ]);

    assert.ok(tagged.definition.tagsExpression.evaluate(['@special']));
    assert.equal(untagged.definition.tagsExpression, undefined);
    assert.equal(outcome.definition.keyword, 'Then');
  });

  it('reports all duplicate definitions from the index and the cache', () => {
    const step = { text: 'DuplicatedItem' };
    const indexed = findDefinitions(step, true);
    const cached = findDefinitions(step);
    for (const matches of [indexed, cached]) {
      const message = formatDuplicateStepsMessage(
        matches,
        'Given DuplicatedItem',
        'sample.feature',
      );
      const variants = message.split('\n').slice(2);
      assert.deepEqual(variants.map((variant) => variant.split(' # ')[0]).sort(), [
        "  - Given 'DuplicatedItem'",
        "  - Given '^DuplicatedItem$'",
      ]);
    }
  });

  it('caches an empty result and clears it when a step definition is added', () => {
    const step = { text: LEDGER_PATTERN };
    const first = lookupWithCalls(step);
    assert.equal(first.calls.length, stepDefinitions.length);
    assert.deepEqual(first.matches, []);
    assert.deepEqual(lookupWithCalls(step, true), { matches: [], calls: [] });

    stepDefinitions.push(definition(LEDGER_PATTERN));
    try {
      assert.equal(findDefinitions(step).length, 1);
    } finally {
      stepDefinitions.pop();
    }
  });

  before(async () => {
    await importBddExpressions();
    savedDefinitions = [...stepDefinitions];
    stepDefinitions.length = 0;
    stepDefinitions.push(
      definition(PANEL_PATTERN),
      definition(DOCSTRING_PATTERN, { bddExpr: true }),
      definition(TABLE_PATTERN, { bddExpr: true }),
      definition('true:false:xxx'),
      definition('xxx:body{DocString}', { bddExpr: true }),
      definition('scoped step'),
      definition('scoped step', { tags: '@special' }),
      definition('scoped step', undefined, 'Then'),
      definition('DuplicatedItem'),
      definition(/^DuplicatedItem$/),
    );
  });

  after(() => {
    stepDefinitions.length = 0;
    stepDefinitions.push(...savedDefinitions);
  });
});

async function assertMatch({ matches, calls }, pattern, value, expectedCalls) {
  assert.equal(matches.length, 1);
  assert.equal(matches[0].definition.pattern, pattern);
  assert.equal(calls.length, expectedCalls);
  const [actualValue] = await matches[0].getMatchedParameters({});
  assert.equal(actualValue, value);
}

function lookupWithCalls(step, useStepIndex) {
  const calls = [];
  const matchStep = StepDefinition.prototype.matchStep;
  StepDefinition.prototype.matchStep = function (input) {
    calls.push(this);
    return matchStep.call(this, input);
  };
  try {
    return { matches: findDefinitions(step, useStepIndex), calls };
  } finally {
    StepDefinition.prototype.matchStep = matchStep;
  }
}

function findDefinitions(step, useStepIndex = false) {
  return new StepFinder({ useStepIndex }).findDefinitions(step);
}

function definition(pattern, providedOptions, keyword = 'Given') {
  return new StepDefinition({
    keyword,
    pattern,
    fn: NOOP,
    originalFn: NOOP,
    location: LOCATION,
    providedOptions,
  });
}
