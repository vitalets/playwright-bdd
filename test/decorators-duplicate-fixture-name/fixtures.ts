import { test as base } from 'playwright-bdd';
import { Fixture, Given } from 'playwright-bdd/decorators';

type Fixtures = {
  todoPage: TodoPage;
  todoPage2: TodoPage2;
};

export const test = base.extend<Fixtures>({
  todoPage: ({}, use) => use(new TodoPage()),
  todoPage2: ({}, use) => use(new TodoPage2()),
});

@Fixture<typeof test>('todoPage')
class TodoPage {
  @Given('TodoPage: step')
  async step() {}
}

// notice the same fixture name
@Fixture<typeof test>('todoPage')
class TodoPage2 {
  @Given('TodoPage2: step')
  async step() {}
}
