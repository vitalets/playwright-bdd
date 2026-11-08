import { Fixture, Given } from 'playwright-bdd/decorators';
import { test } from './fixtures';
import { DataTable } from 'playwright-bdd';

export
@Fixture<typeof test>('pageWithArityChecks')
class PageWithArityChecks {
  @Given('decorator step with omitted parameters {int}')
  stepWithMissingArgs() {}

  @Given('decorator doc step with omitted parameters')
  stepWithMissingDocString() {}

  @Given('decorator step with too many args {int}')
  stepWithTooManyArgs(_value: number, _docString: string, _extra: string) {}

  @Given('decorator doc step with too many args')
  stepWithDocString(_docString: string, _extra: string) {}

  @Given('step without capture parameters')
  @Given(/^step with nested capture ((Alice|Bob))$/)
  stepWithExcessCaptureArgs(_name?: string, _docString?: string, _extra?: string) {}

  @Given('Cucumber expression without parameters')
  @Given('Cucumber expression with number {int} and string {string}')
  stepWithCucumberParameters(_count?: number, _owner?: string) {}

  @Given('regexp without captures')
  @Given(/^regexp with number (\d+) and nested capture ((Alice|Bob))$/)
  stepWithRegexpCaptures(_count?: number, _owner?: string) {}

  @Given('BDD expression without parameters')
  @Given('BDD expression with number :count{int}( and string :owner)', { bddExpr: true })
  stepWithBddParameters(_count?: number, _owner?: string) {}

  @Given('step without a docstring parameter')
  @Given('step with a docstring parameter{DocString}', { bddExpr: true })
  stepWithExcessDocStringArgs(_body?: string, _extra?: string) {}

  @Given('step without number or docstring parameters')
  @Given('step with number :count{int} and required docstring{DocString}', { bddExpr: true })
  stepWithOptionalNumberAndDocString(_first?: number, _body?: string) {}

  @Given('step with required docstring{DocString}', { bddExpr: true })
  @Given('step with numbers {int} and {int}')
  stepWithDocStringOrNumbers(_first?: string | number, _second?: number, _table?: DataTable) {}

  @Given('decorator step with an optional doc string or data table parameter')
  optionalInput(_docString?: string | DataTable) {}

  @Given('decorator step {int} with a default parameter')
  defaultParameter(_count = 0) {}

  @Given('decorator step {int} with rest parameters')
  restParameters(..._counts: number[]) {}
}
