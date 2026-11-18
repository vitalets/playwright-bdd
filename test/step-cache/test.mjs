import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import { importBddExpressions } from '../../dist/steps/bddExpression/index.js';
import { StepDefinition } from '../../dist/steps/stepDefinition.js';
import { StepFinder } from '../../dist/steps/finder.js';
import { stepDefinitions } from '../../dist/steps/stepRegistry.js';
import { DataTable } from '../../dist/cucumber/DataTable.js';

const LOCATION = { file: 'test/step-cache/test.mjs', line: 1 };
const NOOP = () => undefined;
const PANEL_PATTERN = 'User opens the {string} panel on the CatalogItem';
const LEDGER_PATTERN = 'User closes the Ledger panel';
const BLOCK_PATTERN = 'payload:body{DocString}';
const TABLE_PATTERN = 'payload:table{DataTable}';

describe('step cache', () => {
  let savedDefinitions;

  before(async () => {
    await importBddExpressions();
    savedDefinitions = [...stepDefinitions];
    stepDefinitions.length = 0;
    stepDefinitions.push(definition(PANEL_PATTERN), definition(BLOCK_PATTERN, { bddExpr: true }));
  });

  after(() => {
    stepDefinitions.length = 0;
    stepDefinitions.push(...savedDefinitions);
  });

  it('serves a repeated step text without calling matchStep (scan and index)', () => {
    for (const useStepIndex of [false, true]) {
      const stepText = `User opens the "Cart ${useStepIndex}" panel on the CatalogItem`;
      let firstMatches;
      const firstPassCalls = countMatchStepCalls(() => {
        firstMatches = findDefinitions(stepText, useStepIndex);
      });
      let secondMatches;
      const secondPassCalls = countMatchStepCalls(() => {
        secondMatches = findDefinitions(stepText, useStepIndex);
      });
      assert.ok(firstMatches.length > 0, `first lookup should match (index: ${useStepIndex})`);
      assert.ok(firstPassCalls > 0, `first lookup should call matchStep (index: ${useStepIndex})`);
      assert.equal(secondPassCalls, 0, `second lookup should use cache (index: ${useStepIndex})`);
      assert.deepEqual(
        secondMatches.map((match) => match.definition),
        firstMatches.map((match) => match.definition),
        `cached matches should equal the first lookup (index: ${useStepIndex})`,
      );
    }
  });

  it('does not cache a step with a DataTable', () => {
    stepDefinitions.push(definition(TABLE_PATTERN, { bddExpr: true }));
    const firstTable = new DataTable([['name'], ['Alice']]);
    const secondTable = new DataTable([['name'], ['Bob']]);
    try {
      const firstMatches = findDefinitions({ text: 'payload', dataTable: firstTable }, false);
      const firstCalls = countMatchStepCalls(() =>
        findDefinitions({ text: 'payload', dataTable: firstTable }, false),
      );
      const secondCalls = countMatchStepCalls(() =>
        findDefinitions({ text: 'payload', dataTable: secondTable }, false),
      );
      assert.equal(firstMatches.length, 1);
      assert.ok(firstCalls > 0, 'DataTable step should call matchStep on every lookup');
      assert.ok(secondCalls > 0, 'DataTable step should call matchStep on every lookup');
    } finally {
      stepDefinitions.pop();
    }
  });

  it('does not cache a step with a DocString', () => {
    const firstMatches = findDefinitions({ text: 'payload', docString: 'first' }, false);
    const firstCalls = countMatchStepCalls(() =>
      findDefinitions({ text: 'payload', docString: 'first' }, false),
    );
    const secondCalls = countMatchStepCalls(() =>
      findDefinitions({ text: 'payload', docString: 'second' }, false),
    );
    assert.equal(firstMatches.length, 1);
    assert.ok(firstCalls > 0, 'DocString step should call matchStep on every lookup');
    assert.ok(secondCalls > 0, 'DocString step should call matchStep on every lookup');
  });

  it('forgets cached matches when a step definition is added', () => {
    const stepText = 'User closes the Ledger panel';
    assert.equal(findDefinitions(stepText, false).length, 0);
    stepDefinitions.push(definition(LEDGER_PATTERN));
    try {
      assert.equal(findDefinitions(stepText, false).length, 1);
    } finally {
      stepDefinitions.pop();
    }
  });
});

function findDefinitions(step, useStepIndex) {
  const input = typeof step === 'string' ? { text: step } : step;
  return new StepFinder({ useStepIndex }).findDefinitions(input);
}

function countMatchStepCalls(run) {
  let calls = 0;
  const originalMatchStep = StepDefinition.prototype.matchStep;
  StepDefinition.prototype.matchStep = function matchStep(step) {
    calls += 1;
    return originalMatchStep.call(this, step);
  };
  try {
    run();
  } finally {
    StepDefinition.prototype.matchStep = originalMatchStep;
  }
  return calls;
}

function definition(pattern, providedOptions) {
  return new StepDefinition({
    keyword: 'Given',
    pattern,
    fn: NOOP,
    originalFn: NOOP,
    location: LOCATION,
    providedOptions,
  });
}
