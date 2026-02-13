# Написание фич
Пишите фичи в файлах `*.feature` используя [синтаксис Gherkin](https://cucumber.io/docs/gherkin/reference/#keywords). Поддерживаются все ключевые слова.

Пример `sample.feature`:

```gherkin
@desktop
Feature: Playwright site

    @jira:123
    Scenario: Check title
        Given I open url "https://playwright.dev"
        When I click link "Get started"
        Then I see in title "Playwright"
```

Теги позволяют запускать подмножество тестов, используя опцию `--tags` с [выражением тегов](https://cucumber.io/docs/cucumber/api/?lang=javascript#tag-expressions):
```
npx bddgen --tags "@desktop and not @slow" && npx playwright test
```

?> С версии Playwright **1.42** теги Gherkin отображаются на [теги Playwright](https://playwright.dev/docs/test-annotations#tag-tests)

Вы также можете [получить доступ к тегам внутри определений шагов](ru/writing-steps/bdd-fixtures.md#tags).

