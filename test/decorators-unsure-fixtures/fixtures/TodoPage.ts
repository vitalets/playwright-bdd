import { Fixture, Given } from '../../../dist/decorators';
import { test } from '.';

class BasePage {
  @Given('BasePage: step')
  step() {}
}

export
@Fixture<typeof test>('todoPage')
class TodoPage extends BasePage {
  @Given('TodoPage: step')
  async step() {}
}

export
@Fixture<typeof test>('adminTodoPage')
class AdminTodoPage extends TodoPage {
  @Given('AdminTodoPage: step')
  async step() {}
}

export
@Fixture<typeof test>('todoPage2')
class TodoPage2 extends BasePage {
  @Given('TodoPage2: step')
  async step() {}
}
