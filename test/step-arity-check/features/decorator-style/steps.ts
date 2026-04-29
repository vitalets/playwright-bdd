import { Fixture, Given } from 'playwright-bdd/decorators';
import { test } from './fixtures';

export
@Fixture<typeof test>('pageWithArityChecks')
class PageWithArityChecks {
  @Given('decorator step with missing args {int}')
  stepWithMissingArgs() {}

  @Given('decorator doc step with missing args')
  stepWithMissingDocString() {}

  @Given('decorator step with too many args {int}')
  stepWithTooManyArgs(_value: number, _extra: string) {}

  @Given('decorator doc step with too many args')
  stepWithDocString(_docString: string, _extra: string) {}
}
