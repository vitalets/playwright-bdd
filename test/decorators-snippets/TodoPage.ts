import { Fixture, Given } from '../../dist/decorators';
import { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  @Given('I am on todo page')
  async init() {}
}
