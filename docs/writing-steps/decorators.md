# Decorators
Playwright-BDD supports [TypeScript v5 decorators](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators) as a convenient way to define steps right inside [Page Object Models (POM)](https://playwright.dev/docs/pom). 

Decorators are imported from `playwright-bdd/decorators`:
```ts
import { Fixture, Given, When, Then } from 'playwright-bdd/decorators';
```

Apply the `@Fixture` decorator to the whole class to bind it with the Playwright fixture name. Apply the `@Given, @When, @Then` decorators to particular methods:
```ts
// TodoPage.ts
import { Page, expect } from '@playwright/test';
import { Fixture, Given, When, Then } from 'playwright-bdd/decorators';

export @Fixture('todoPage') class TodoPage {
  constructor(public page: Page) { }

  @Given('I am on todo page')
  async open() {
    await this.page.goto('https://demo.playwright.dev/todomvc/');
  }

  @When('I add todo {string}')
  async addToDo(text: string) {
    await this.page.locator('input.new-todo').fill(text);
    await this.page.locator('input.new-todo').press('Enter');
  }

  @Then('visible todos count is {int}')
  async checkVisibleTodosCount(count: number) {
    await expect(this.page.getByTestId('todo-item')).toHaveCount(count);
  }
}
```

Then use this class in `test.extend` as a regular fixture:
```ts
// fixtures.ts
import { test as base } from 'playwright-bdd';
import { TodoPage } from './TodoPage';

export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: ({ page }, use) => use(new TodoPage(page)),
});
```

And add `fixtures.ts` to steps in `playwright.config.ts`:
```ts
const testDir = defineBddConfig({
  features: 'features/todo.feature',
  steps: 'fixtures.ts',
  // ...
});
```

Now you can use these steps in `.feature` files:
```gherkin
# features/todo.feature
Feature: Todo Page

    Scenario: Adding todos
      Given I am on todo page
      When I add todo "foo"
      And I add todo "bar"
      Then visible todos count is 2
```
Check out the [full example of using decorators](https://github.com/vitalets/playwright-bdd/tree/main/examples/decorators) with playwright-bdd.

> To get VSCode Cucumber autocomplete working with decorators set `cucumberautocomplete.strictGherkinCompletion = false` in `.vscode/settings.json`

## Inheritance
When one Page Object is inherited from another, `playwright-bdd` can automatically guess
what fixture to use in a particular scenario. Imagine two parent-child classes with decorator steps:

```ts
// TodoPage
export @Fixture('todoPage') class TodoPage {
  @Given('I am on todo page')
  async open() { ... }
}

// AdminTodoPage inherited from TodoPage
export @Fixture('adminTodoPage') class AdminTodoPage extends TodoPage {
  @When('I add todo {string}')
  async addToDo(text: string) { ... }
}
```

And a scenario that uses both steps:

```gherkin
Scenario: Adding todos
  Given I am on todo page # <- step defined in TodoPage
  When I add todo "foo"   # <- step defined in AdminTodoPage
```

Here Playwright-BDD will use a single fixture `AdminTodoPage` for both steps instead of creating two separate fixtures.

In some cases, you may want to force the usage of a particular fixture.
For that, you can apply the special tag `@fixture:%name%`:

```gherkin
@fixture:adminTodoPage
Feature: Some feature

    Background: 
      Given I am on todo page # <- will use AdminTodoPage

    Scenario: Adding todos
      When I add todo "foo"   # <- will use AdminTodoPage
```

## Accessing BDD fixtures

Decorator steps accept only step parameters. To access any custom or BDD fixture, you should manually pass the required fixtures to the POM constructor and access them via `this` keyword.

**Example**

1. Define `$tags` and `$test` fixtures as constructor arguments and use them in the step:

```ts
// TodoPage.ts
import { Page, expect } from '@playwright/test';
import { Fixture, Given, When, Then } from 'playwright-bdd/decorators';
import { test } from './fixtures';

export @Fixture<typeof test>('todoPage') class TodoPage {
  constructor(
    public page: Page, 
    protected $tags: string[], 
    protected $test: typeof test
  ) {}

  @Given('I am on todo page')
  async open() {
    if (this.$tags.includes('firefox')) {
      this.$test.skip();
    }
  }
```

2. Pass `$tags` and `$test` to the POM constructor:

```ts
// fixtures.ts
export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: ({ page, $tags, $test }, use) => {
    const todoPage = new TodoPage(page, $tags, $test as typeof test);
    await use(todoPage);
  },
});
```