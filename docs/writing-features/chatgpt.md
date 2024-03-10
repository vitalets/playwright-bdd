# Using ChatGPT
[ChatGPT](https://chat.openai.com) can write BDD scenarios for you!
All you need is to describe a user story and provide step definitions.

* For the user story you can just use general phrases defining the feature
* For step definitions you can utilize [`bddgen export`](cli.md#bddgen-export) that prints list of all steps

**Example:**

Imagine you have simple [Todo App](https://demo.playwright.dev/todomvc/#/) and want to cover it with BDD tests written by ChatGPT and executed by Playwright.

First you need to write step definitions:

> We still write step definitions manually to get reliable locators, but in the future AI can generate them as well

```ts
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd(test);

Given('I am on todo page', async ({ page }) => { 
  await page.goto('https://demo.playwright.dev/todomvc/');
});

When('I add todo {string}', async ({ page }, text: string) => {
  await page.locator('input.new-todo').fill(text);
  await page.locator('input.new-todo').press('Enter');
});

When('I remove todo {string}', async ({ page }, text: string) => {
  const todo = page.getByTestId('todo-item').filter({ hasText: text });
  await todo.hover();
  await todo.getByRole('button', { name: 'Delete' }).click();
});

Then('visible todos count is {int}', async ({ page }, count: number) => { 
  await expect(page.getByTestId('todo-item')).toHaveCount(count);
});
```
Now you can extract all available step patterns with `bddgen export`:
```
$ bddgen export

List of all steps found by config: playwright.config.ts

* Given I am on todo page
* When I add todo {string}
* When I remove todo {string}
* Then visible todos count is {int}
```

And then use the following **ChatGPT prompt template**:
```
Generate BDD scenarios for the following user story:

{user story description}

Format output as a single gherkin file.
Include user story text in the file.
Use Background for common steps.
Use "And" keyword for repeated "Given" / "When" / "Then".
Strictly use only the following step definitions:

{steps list from bddgen export}
```

> Feel free to improve that template and share the results

Filled prompt for Todo app:
```
Generate BDD scenarios for the following user story:

As a user I want to add and remove todo items in todo list app.

Format output as a single gherkin file.
Include user story text in the file.
Use Background for common steps.
Use "And" keyword for repeated "Given" / "When" / "Then".
Strictly use only the following step definitions:

* Given I am on todo page
* When I add todo {string}
* When I remove todo {string}
* Then visible todos count is {int}
```

ChatGPT output:
```gherkin
Feature: Adding and Removing Todo Items

  As a user
  I want to add and remove todo items in a todo list app
  So that I can manage my tasks effectively

  Background:
    Given I am on todo page

  Scenario: Add a new todo and remove it
    When I add todo "Buy groceries"
    And I remove todo "Buy groceries"
    Then visible todos count is 0

  Scenario: Add multiple todos and remove one
    When I add todo "Buy groceries"
    And I add todo "Go to the gym"
    And I add todo "Read a book"
    And I remove todo "Go to the gym"
    Then visible todos count is 2

  Scenario: Add and remove multiple todos
    When I add todo "Buy groceries"
    And I add todo "Go to the gym"
    And I add todo "Read a book"
    And I remove todo "Buy groceries"
    And I remove todo "Go to the gym"
    Then visible todos count is 1

  Scenario: Add multiple todos and remove all
    When I add todo "Buy groceries"
    And I add todo "Go to the gym"
    And I add todo "Read a book"
    And I remove todo "Buy groceries"
    And I remove todo "Go to the gym"
    And I remove todo "Read a book"
    Then visible todos count is 0
```

Now you can save that `.feature` file and run tests:
```
npx bddgen && npx playwright test
```

Html report:
<img src="https://github.com/vitalets/playwright-bdd/assets/1473072/75b62533-7f9c-4886-a5d9-7af6b8231676"/>
