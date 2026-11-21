import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import { importBddExpressions } from '../../dist/steps/bddExpression/index.js';
import { StepDefinition } from '../../dist/steps/stepDefinition.js';
import { StepFinder } from '../../dist/steps/finder.js';
import { stepDefinitions } from '../../dist/steps/stepRegistry.js';

const LOCATION = { file: 'test/step-index/test.mjs', line: 1 };
const NOOP = () => undefined;
const CATALOG_FIELD = 'User sees the {string} field on the CatalogItem';
const CATALOG_PANEL = 'User closes the CatalogItem panel';
const SHIPPING_LABEL = 'User checks the balance on the ShippingLabel';
const CUCUMBER_ALTERNATIVE = 'User opens CatalogItem via PrimaryAction/SecondaryAction';
const CUCUMBER_NAMED = 'User opens :itemName';
const BRACE_QUANTIFIER_REGEXP = /abcdefghij{foo|bar}/;
const BDD_PANEL = 'User opens the CatalogItem panel';

describe('step index', () => {
  let savedDefinitions;

  before(async () => {
    await importBddExpressions();
    savedDefinitions = [...stepDefinitions];
    stepDefinitions.length = 0;
    stepDefinitions.push(...makeDefinitions());
  });

  after(() => {
    stepDefinitions.length = 0;
    stepDefinitions.push(...savedDefinitions);
  });

  it('matches a cucumber expression with {string}', () => {
    assertSameMatches('User sees the "Amount" field on the CatalogItem');
  });

  it('matches a regexp with optional char (singular, on scan list)', () => {
    assertSameMatches('transaction recorded');
  });

  it('matches a regexp with optional char (plural, on scan list)', () => {
    assertSameMatches('transactions recorded');
  });

  it('matches alternation groups (on scan list)', () => {
    assertSameMatches('acknowledged');
    assertSameMatches('rejected');
  });

  it('indexes cucumber alternative by shared literal (CatalogItem)', () => {
    const alternative = findDefinition(CUCUMBER_ALTERNATIVE);
    const shippingLabel = findDefinition(SHIPPING_LABEL);
    const called = matchStepCalls('nothing about shipping here');
    assert.equal(called.includes(alternative), false);
    assert.equal(called.includes(shippingLabel), false);
    const calledWithKeyword = matchStepCalls('something CatalogItem related');
    assert.ok(calledWithKeyword.includes(alternative));
    assert.equal(findWithIndex('User opens CatalogItem via PrimaryAction').length, 1);
    assertSameMatches('User opens CatalogItem via PrimaryAction');
    assertSameMatches('User opens CatalogItem via SecondaryAction');
  });

  it('matches case-insensitive regexp (on scan list)', () => {
    assertSameMatches('Catalog Item');
  });

  it('matches hex escape (on scan list)', () => {
    assertSameMatches('Mabcdefgh');
  });

  it('matches named backreference (on scan list)', () => {
    assertSameMatches('hello hello');
  });

  it('indexes cucumber :name literal by the identifier word', () => {
    const named = findDefinition(CUCUMBER_NAMED);
    const catalogField = findDefinition(CATALOG_FIELD);
    // :itemName is literal text in cucumber expression grammar.
    const called = matchStepCalls('nothing about catalogs here');
    assert.equal(called.includes(named), false);
    assert.equal(called.includes(catalogField), false);
    const calledWithKeyword = matchStepCalls('something itemName related');
    assert.ok(calledWithKeyword.includes(named));
    assert.equal(findWithIndex('User opens :itemName').length, 1);
    assertSameMatches('User opens :itemName');
  });

  it('compares every definition that shares the index word', () => {
    const seesField = findDefinition(CATALOG_FIELD);
    const closesPanel = findDefinition(CATALOG_PANEL);
    const alternative = findDefinition(CUCUMBER_ALTERNATIVE);
    const shippingLabel = findDefinition(SHIPPING_LABEL);
    const called = matchStepCalls('User sees the "Price" field on the CatalogItem');
    assert.ok(called.includes(seesField));
    assert.ok(called.includes(closesPanel));
    assert.ok(called.includes(alternative));
    assert.equal(called.includes(shippingLabel), false);
    assertSameMatches('User sees the "Price" field on the CatalogItem');
  });

  it('keeps BDD Expressions on the scan list', () => {
    const bddDefinition = definition(BDD_PANEL, { bddExpr: true });
    stepDefinitions.push(bddDefinition);
    try {
      const called = matchStepCalls('nothing here');
      const cucumberPanel = findDefinition(CATALOG_PANEL);
      assert.ok(called.includes(bddDefinition));
      assert.equal(called.includes(cucumberPanel), false);
    } finally {
      stepDefinitions.pop();
    }
  });

  it('keeps regexp with brace quantifier on scan list (edge case)', () => {
    // A naive parser would require "abcdefghi", but /abcdefghij{foo|bar}/ also matches "bar}", so regexps stay on the scan list.
    const braceRegexp = findDefinition(BRACE_QUANTIFIER_REGEXP);
    const called = matchStepCalls('bar}');
    assert.ok(called.includes(braceRegexp));
    assertSameMatches('bar}');
  });

  it('matches a DocString step the same way as a full scan', async () => {
    const blockDefinition = definition('payload:body{DocString}', { bddExpr: true });
    stepDefinitions.push(blockDefinition);
    try {
      await assertSameParameters({ text: 'payload' });
      await assertSameParameters({ text: 'payload', docString: 'first' });
      await assertSameParameters({ text: 'payload', docString: 'second' });
      await assertSameParameters({ text: 'payload' });
    } finally {
      stepDefinitions.pop();
    }
  });

  it('non-matching text returns empty from both', () => {
    assert.equal(findWithIndex('something completely different').length, 0);
    assert.equal(findWithoutIndex('something completely different').length, 0);
  });
});

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

function makeDefinitions() {
  return [
    definition(CATALOG_FIELD),
    definition(CUCUMBER_ALTERNATIVE),
    definition(/transactions? recorded/),
    definition(/(acknowledged|rejected)/),
    definition(/catalog item/i),
    definition(/\x4Dabcdefgh/),
    definition(/^(?<greeting>\w+) \k<greeting>$/),
    definition(BRACE_QUANTIFIER_REGEXP),
    definition(CUCUMBER_NAMED),
    definition(CATALOG_PANEL),
    definition(SHIPPING_LABEL),
  ];
}

function findDefinition(pattern) {
  const found = stepDefinitions.find((stepDefinition) => stepDefinition.pattern === pattern);
  assert.ok(found, `missing definition: ${pattern}`);
  return found;
}

function findWithIndex(step) {
  return findDefinitions(step, { useStepIndex: true });
}

function findWithoutIndex(step) {
  return findDefinitions(step, {});
}

function findDefinitions(step, config) {
  const input = typeof step === 'string' ? { text: step } : step;
  return new StepFinder(config).findDefinitions(input);
}

function assertSameMatches(stepText) {
  const indexed = findWithIndex(stepText).map((match) => match.definition);
  const bruteForce = findWithoutIndex(stepText).map((match) => match.definition);
  assert.deepEqual(indexed, bruteForce, `Mismatch for: "${stepText}"`);
}

async function assertSameParameters(step) {
  const indexed = findWithIndex(step);
  const bruteForce = findWithoutIndex(step);
  assert.equal(indexed.length, bruteForce.length, `count for ${JSON.stringify(step)}`);
  for (let matchIndex = 0; matchIndex < indexed.length; matchIndex += 1) {
    assert.deepEqual(
      await indexed[matchIndex].getMatchedParameters({}),
      await bruteForce[matchIndex].getMatchedParameters({}),
    );
  }
}

function matchStepCalls(stepText) {
  const called = [];
  const originalMatchStep = StepDefinition.prototype.matchStep;
  StepDefinition.prototype.matchStep = function matchStep(step) {
    called.push(this);
    if (this.usesBddExpression()) return undefined;
    return originalMatchStep.call(this, step);
  };
  try {
    findWithIndex(stepText);
  } finally {
    StepDefinition.prototype.matchStep = originalMatchStep;
  }
  return called;
}
