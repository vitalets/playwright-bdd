# CLI

## `bddgen test` (или просто `bddgen`)
Генерирует файлы тестов Playwright из Gherkin документов (файлов `.feature`).
Эта команда обычно за которой следует `npx playwright test` для запуска сгенерированных тестов.
Также предполагается, что существует `playwright.config.(ts|js)` с одним или несколькими вызовами [`defineBddConfig()`](configuration/index.md).

Примеры:

* Генерировать и запустить тестовые файлы используя `playwright.config.ts` в расположении по умолчанию (рабочая директория):
    ```
    npx bddgen && npx playwright test
    ```

* Использовать опцию `--tags` для генерации тестов с [фильтрацией по тегам](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions):
    ```
    npx bddgen --tags "@foo and not @bar" && npx playwright test
    ```

* Использовать опцию `-c` / `--config` для установки пользовательской конфигурации. Примечание: одинаковая конфигурация должна быть предоставлена обеим командам `bddgen` и `playwright test`:
    ```
    npx bddgen -c path/to/playwright.config.ts && npx playwright test -c path/to/playwright.config.ts
    ```

* Использовать `-h` для показа справки:
    ```
    npx bddgen test -h
    # или для показа глобальной справки
    npx bddgen -h
    ```

## `bddgen export`
Выводит список всех найденных определений шагов.
Полезно для [генерации BDD сценариев с ChatGPT](writing-features/chatgpt.md).
```
$ npx bddgen export
```
Пример вывода:
```
Using config: playwright.config.ts
List of all steps (4):

* Given I am on todo page
* When I add todo {string}
* When I remove todo {string}
* Then visible todos count is {int}
```
#### Опции
* `--config` - путь к конфигурации Playwright
* `--unused-steps` - вывести только неиспользуемые шаги

## `bddgen env`
Отображает информацию о текущем окружении:
```
$ npx bddgen env
```
Пример вывода:
```
Playwright-BDD environment info:

platform: darwin
node: v18.16.0
playwright-bdd: v5.1.1
@playwright/test: v1.36.2
@cucumber/cucumber: v9.2.0
```
