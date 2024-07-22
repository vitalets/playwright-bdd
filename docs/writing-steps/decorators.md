# Decorators
Playwright-bdd supports [TypeScript v5 decorators](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators) as a convenient way to define steps right inside [Page Object Models](https://playwright.dev/docs/pom). For example, you can create the following `TodoPage` class:

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

And set `importTestFrom` to `./fixtures.ts` in `playwright.config.ts`:
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
Check out [full example of using decorators](https://github.com/vitalets/playwright-bdd/tree/main/examples/decorators) with playwright-bdd.

> To get VSCode Cucumber autocomplete working with decorators set `cucumberautocomplete.strictGherkinCompletion = false` in `.vscode/settings.json`

## Inheritance
When one Page Object is inherited from another, `playwright-bdd` can automatically guess
what fixture to use in particular scenario. Imagine two parent-child classes with decorator steps:

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

And scenario that uses both steps:

```gherkin
Scenario: Adding todos
  Given I am on todo page # <- step defined in TodoPage
  When I add todo "foo"   # <- step defined in AdminTodoPage
```

Here `playwright-bdd` will use single fixture `AdminTodoPage` for both steps instead of creating two separate fixtures.

In some cases you may want to force usage of particular fixture.
For that you can apply special tag `@fixture:%name%`:

```gherkin
@fixture:adminTodoPage
Feature: Some feature

    Background: 
      Given I am on todo page # <- will use AdminTodoPage

    Scenario: Adding todos
      When I add todo "foo"   # <- will use AdminTodoPage
```
