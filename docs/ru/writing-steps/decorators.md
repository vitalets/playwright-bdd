# Декораторы
Playwright-BDD поддерживает [декораторы TypeScript v5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators) как удобный способ определения шагов прямо внутри [Page Object Models (POM)](https://playwright.dev/docs/pom).

Декораторы импортируются из `playwright-bdd/decorators`:
```ts
import { Fixture, Given, When, Then } from 'playwright-bdd/decorators';
```

Примените декоратор `@Fixture` ко всему классу, чтобы связать его с именем фикстуры Playwright. Примените декораторы `@Given, @When, @Then` к конкретным методам:
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

Затем используйте этот класс в `test.extend` как обычную фикстуру:
```ts
// fixtures.ts
import { test as base } from 'playwright-bdd';
import { TodoPage } from './TodoPage';

export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: ({ page }, use) => use(new TodoPage(page)),
});
```

И добавьте `fixtures.ts` к шагам в `playwright.config.ts`:
```ts
const testDir = defineBddConfig({
  features: 'features/todo.feature',
  steps: 'fixtures.ts',
  // ...
});
```

Теперь вы можете использовать эти шаги в файлах `.feature`:
```gherkin
# features/todo.feature
Feature: Todo Page

    Scenario: Adding todos
      Given I am on todo page
      When I add todo "foo"
      And I add todo "bar"
      Then visible todos count is 2
```
Ознакомьтесь с [полным примером использования декораторов](https://github.com/vitalets/playwright-bdd/tree/main/examples/decorators) с playwright-bdd.

> Чтобы автодополнение VSCode Cucumber работало с декораторами, установите `cucumberautocomplete.strictGherkinCompletion = false` в `.vscode/settings.json`

## Наследование
Когда один Page Object наследуется от другого, `playwright-bdd` может автоматически угадать,
какую фикстуру использовать в конкретном сценарии. Представьте два класса родитель-потомок с шагами-декораторами:

```ts
// TodoPage
export @Fixture('todoPage') class TodoPage {
  @Given('I am on todo page')
  async open() { ... }
}

// AdminTodoPage унаследованный от TodoPage
export @Fixture('adminTodoPage') class AdminTodoPage extends TodoPage {
  @When('I add todo {string}')
  async addToDo(text: string) { ... }
}
```

И сценарий, который использует оба шага:

```gherkin
Scenario: Adding todos
  Given I am on todo page # <- шаг определен в TodoPage
  When I add todo "foo"   # <- шаг определен в AdminTodoPage
```

Здесь Playwright-BDD будет использовать единую фикстуру `AdminTodoPage` для обоих шагов вместо создания двух отдельных фикстур.

?> Убедитесь, что и родительские, и дочерние POM покрыты паттерном `steps` в конфигурации.

В некоторых случаях вы можете захотеть принудительно использовать конкретную фикстуру.
Для этого вы можете применить специальный тег `@fixture:%name%`:

```gherkin
@fixture:adminTodoPage
Feature: Some feature

    Background:
      Given I am on todo page # <- будет использовать AdminTodoPage

    Scenario: Adding todos
      When I add todo "foo"   # <- будет использовать AdminTodoPage
```

## Доступ к BDD фикстурам<a id="accessing-bdd-fixtures"></a>

Шаги-декораторы принимают только параметры шага. Для доступа к любым пользовательским или BDD фикстурам вы должны вручную передать требуемые фикстуры в конструктор POM и обращаться к ним через ключевое слово `this`.

**Пример**

1. Определите фикстуры `$tags` и `$test` как аргументы конструктора и используйте их в шаге:

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

2. Передайте `$tags` и `$test` в конструктор POM:

```ts
// fixtures.ts
export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: ({ page, $tags, $test }, use) => {
    const todoPage = new TodoPage(page, $tags, $test as typeof test);
    await use(todoPage);
  },
});
```
