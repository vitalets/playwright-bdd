# Специальные теги

Существуют некоторые специальные теги для улучшения опыта тестирования.

## @only
Используйте тег `@only` для запуска отдельной фичи или сценария:
```gherkin
@only
Feature: Playwright site

    @only
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## @skip / @fixme
Используйте тег `@skip` (или `@fixme`) для пропуска конкретной фичи или сценария:
```gherkin
@skip
Feature: Playwright site

    @skip
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

Для условного пропуска сценария используйте [$test и $tags фикстуры](ru/writing-steps/bdd-fixtures.md#test-and-testinfo).

## @fail
Используйте тег `@fail` для обозначения фичи или сценария как [падающего](https://playwright.dev/docs/api/class-test#test-fail):
```gherkin
Feature: Playwright site

    @fail
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## @slow
Используйте тег `@slow` для обозначения фичи или сценария как [медленного](https://playwright.dev/docs/api/class-test#test-slow) (timeout x 3):
```gherkin
Feature: Playwright site

    @slow
    Scenario: Check title
        Given I open url "https://playwright.dev"
```

## @timeout:N
Используйте тег `@timeout:N` для установки таймаута сценария:
```gherkin
Feature: Playwright site

    @timeout:5000
    Scenario: Check title
        Given I open url "https://playwright.dev"
```
Если определен на уровне фичи, он устанавливает таймаут для **каждого сценария** внутри, а не для самой фичи. См. [`test.describe.configure`](https://playwright.dev/docs/api/class-test#test-describe-configure) для деталей. Пример:
```gherkin
@timeout:5000
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"

    Scenario: Check navigation
        Given I open url "https://playwright.dev"
```

## @retries:N
Используйте тег `@retries:N` для установки повторных попыток для всех сценариев в фиче:
```gherkin
@retries:2
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"
```
Или установите повторные попытки для отдельного сценария:
```gherkin
Feature: Playwright site

    @retries:2
    Scenario: Check title
        Given I open url "https://playwright.dev"
```
> Когда тег `@retries` применяется к отдельному сценарию, сгенерированный тест оборачивается в *анонимный describe*, см. [microsoft/playwright#10825](https://github.com/microsoft/playwright/issues/10825)

## @mode:xxx
Используйте один из следующих тегов для установки [режима выполнения](https://playwright.dev/docs/test-parallel#parallelize-tests-in-a-single-file) для фичи или схемы сценария:

* `@mode:parallel`
* `@mode:serial`
* `@mode:default`

Пример:

```gherkin
@mode:parallel
Feature: Playwright site

    Scenario: Scenario 1
        Given I open url "https://playwright.dev"

    Scenario: Scenario 2
        Given I open url "https://playwright.dev"
```

Оба `Scenario 1` и `Scenario 2` будут выполнены параллельно в отдельных воркерах.

При использовании `@mode:serial` вы можете ознакомиться с [Передачей данных между сценариями](ru/writing-steps/passing-data-between-scenarios.md).

!> Обратите внимание, что тег `@mode` не применим к отдельному сценарию
