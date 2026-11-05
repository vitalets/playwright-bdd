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

  @Given('shared method with excess parameters for every expression')
  @Given(/^unused expression with nested captures ((Alice|Bob))$/)
  sharedMethod(_name?: string, _docString?: string, _extra?: string) {}

  @Given('decorator step')
  @Given('decorator step {int} for {string}')
  sharedCucumber(_count?: number, _owner?: string) {}

  @Given('regexp decorator step')
  @Given(/^regexp decorator step (\d+) for ((Alice|Bob))$/)
  sharedRegexp(_count?: number, _owner?: string) {}

  @Given('bdd-expr decorator step')
  @Given('bdd-expr decorator step :count{int}( for :owner)', { bddExpr: true })
  sharedBdd(_count?: number, _owner?: string) {}

  @Given('decorator step with an optional doc string or data table parameter')
  optionalInput(_docString?: string | DataTable) {}

  @Given('decorator step {int} with a default parameter')
  defaultParameter(_count = 0) {}

  @Given('decorator step {int} with rest parameters')
  restParameters(..._counts: number[]) {}
}
