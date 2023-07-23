import { Fixture, Given } from '../../../dist/decorators';
import { test } from '.';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  @Given('I am on todo page')
  async init() {}
}
