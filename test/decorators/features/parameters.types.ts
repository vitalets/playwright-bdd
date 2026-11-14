import { Given, When, Then, Step } from 'playwright-bdd/decorators';
import { DataTable } from 'playwright-bdd';

type Color = 'red' | 'blue' | 'yellow';

declare const runtimeFlag: boolean;
declare const dynamicPattern: string;

// Compile-only integration checks: decorators validate annotations, not infer them.
export class DecoratorParameters {
  @Given('custom :color{color}', { bddExpr: true })
  customUnion(_color: Color) {}

  // @ts-expect-error Known slots are validated even alongside unknown custom types.
  @Given('BDD custom color :color{color} with count {int}', { bddExpr: true })
  incompatibleBuiltin(_color: Color, _count: string) {}

  @When('add :product( with quantity :quantity{int})', { bddExpr: true })
  optional(_product: string, _quantity?: number) {}

  // @ts-expect-error An optional capture can produce undefined.
  @When('add :product( with quantity :quantity{int})', { bddExpr: true })
  requiredOptional(_product: string, _quantity: number) {}

  @Then('color {red/blue}', { bddExpr: true })
  union(_color: Color) {}

  // @ts-expect-error The method must also accept blue.
  @Then('color {red/blue}', { bddExpr: true })
  narrowUnion(_color: 'red') {}

  // @ts-expect-error A string parameter is broader than the Color union.
  @Step('color {string}', { bddExpr: true })
  narrowString(_color: Color) {}

  @Given('count {int} for :owner', { bddExpr: true })
  ignoredTrailing(_count: number) {}

  @Given('count {int}', { bddExpr: true })
  ignoredAll() {}

  @Given('count {int}', { bddExpr: true })
  rest(..._args: number[]) {}

  // @ts-expect-error Rest parameters must accept the captured number.
  @Given('count {int}', { bddExpr: true })
  incompatibleRest(..._args: string[]) {}

  @Given('payload{DocString}{DataTable}', { bddExpr: true })
  blocks(_body: string, _table: DataTable) {}

  // @ts-expect-error Explicit DataTable parameters use the concrete DataTable type.
  @Given('payload{DataTable}', { bddExpr: true })
  incompatibleBlock(_table: string) {}

  @Given('count {int}', { bddExpr: true })
  implicitDocString(_count: number, _body: string) {}

  @Given('count {int}', { bddExpr: true })
  implicitDataTable(_count: number, _table: DataTable) {}

  @Given('count {int}')
  defaultDisabled(_count: string) {}

  @Given('count {int}', { bddExpr: false })
  explicitlyDisabled(_count: string) {}

  // A boolean flag may be false at runtime, so validation requires literal true
  // and deliberately accepts string here despite the {int} parameter.
  @Given('count {int}', { bddExpr: runtimeFlag })
  unknownFlag(_count: string) {}

  @Given(dynamicPattern, { bddExpr: true })
  unknownPattern(_count: string) {}

  @Given(/^count (\d+)$/, { bddExpr: true })
  regex(_count: string) {}
}
