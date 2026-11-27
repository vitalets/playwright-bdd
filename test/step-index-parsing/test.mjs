import { importBddExpressions } from '../../dist/steps/bddExpression/index.js';
import { StepDefinition } from '../../dist/steps/stepDefinition.js';
import { getRequiredLiterals } from '../../dist/steps/stepIndex/requiredLiterals.js';
import { expect, test, TestDir } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(`${testDir.name}: extracts only required literals from parsed Cucumber Expressions`, () => {
  expectRequiredLiterals('{string} requiredWord1 requiredWord2 left/right (optional)', [
    'requiredWord1',
    'requiredWord2',
  ]);
  expectRequiredLiterals('User opens :itemName', ['User', 'opens', ':itemName']);
  expectRequiredLiterals('prefix(a)/prefix(b)', ['prefix']);
  expectRequiredLiterals('{string} (optional)', []);
  expectRequiredLiterals('requiredWord{int}{word} trailingWord', ['requiredWord', 'trailingWord']);
  expectRequiredLiterals(String.raw`literal\/separator`, ['literal/separator']);
  expectRequiredLiterals('prefix(a)/prefix(b)/different(c)', []);
  expectRequiredLiterals('requiredWord(requiredSuffix) right/left', ['requiredWord']);
});

test(`${testDir.name}: extracts only required literals from parsed BDD Expressions`, async () => {
  await importBddExpressions();
  const options = { bddExpr: true };

  expectRequiredLiterals(':value{word} RequiredWord (OptionalWord)', ['RequiredWord'], options);
  expectRequiredLiterals(
    '[CommonWord first/CommonWord second] {SharedWord first/SharedWord second}',
    ['CommonWord', 'SharedWord'],
    options,
  );
  expectRequiredLiterals('[PrimaryAction/SecondaryAction] :parameterName{word}', [], options);
  expectRequiredLiterals('CatalogItem:body{DocString}', ['CatalogItem'], options);
  expectRequiredLiterals(':value{word}([OptionalWord first/OptionalWord second])', [], options);
  expectRequiredLiterals(
    '[OuterWord [first/second]/OuterWord [third/fourth]]',
    ['OuterWord'],
    options,
  );
  expectRequiredLiterals('{SharedWord first/SharedWord second/}', [], options);
  expectRequiredLiterals(
    String.raw`\[RequiredWord\] literal\/separator`,
    ['[RequiredWord]', 'literal/separator'],
    options,
  );
  expectRequiredLiterals(
    '[RequiredWord:body{DocString}/RequiredWord:table{DataTable}]',
    ['RequiredWord'],
    options,
  );
});

function expectRequiredLiterals(pattern, expected, providedOptions) {
  const fn = () => {};
  const definition = new StepDefinition({
    keyword: 'Given',
    pattern,
    fn,
    originalFn: fn,
    location: { file: import.meta.filename, line: 1, column: 1 },
    providedOptions,
  });
  expect(getRequiredLiterals(definition), pattern).toEqual(expected);
}
