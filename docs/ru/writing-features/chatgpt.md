# Использование ChatGPT
[ChatGPT](https://chat.openai.com) может написать BDD сценарии за вас!
Все, что вам нужно, это описать пользовательскую историю и предоставить определения шагов.

* Для пользовательской истории вы можете просто использовать общие фразы, описывающие функцию
* Для определений шагов вы можете использовать [`bddgen export`](ru/cli.md#bddgen-export), которая выводит список всех шагов

**Пример:**

Представьте, что у вас есть простое [Todo приложение](https://demo.playwright.dev/todomvc/#/) и вы хотите покрыть его BDD тестами, написанными ChatGPT и выполняемыми Playwright.

Сначала вам нужно написать определения шагов:

> Мы по-прежнему пишем определения шагов вручную, чтобы получить надежные локаторы, но в будущем AI сможет генерировать их также

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
Теперь вы можете извлечь все доступные паттерны шагов с помощью `bddgen export`:
```
$ bddgen export

List of all steps found by config: playwright.config.ts

* Given I am on todo page
* When I add todo {string}
* When I remove todo {string}
* Then visible todos count is {int}
```

И затем использовать следующий **шаблон промпта для ChatGPT**:
```
Generate BDD scenarios in Gherkin for the following user story:

{user story description}

Format output as a single gherkin file.
Include user story text in the file.
Use Background for common steps.
Use "And" keyword for repeated "Given" / "When" / "Then".
Strictly use only the following step definitions:

{steps list from bddgen export}
```

> Не стесняйтесь улучшать этот шаблон и делиться результатами

Заполненный промпт для Todo приложения:
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

Вывод ChatGPT:
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

Теперь вы можете сохранить этот файл `.feature` и запустить тесты:
```
npx bddgen && npx playwright test
```

Html отчет:
<img src="https://github.com/vitalets/playwright-bdd/assets/1473072/75b62533-7f9c-4886-a5d9-7af6b8231676"/>
