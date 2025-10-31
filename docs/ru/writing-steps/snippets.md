# Сниппеты

Сниппеты позволяют быстро создать определения для отсутствующих шагов.

Пример:

Представьте, что вы добавили новый файл фичи:
```gherkin
Feature: Playwright site

    Scenario: Check title
        Given I open url "https://playwright.dev"
        When I click link "Get started"
        Then I see in title "Playwright"
```
И выполнили его без определения реализации шагов:
```
npx bddgen && npx playwright test
```
Вывод показывает ошибку и предоставляет сниппеты кода, которые вы можете скопировать и вставить в свою кодовую базу:
```
Missing step definitions: 3

Given('I open url {string}', async ({}, arg) => {
  // Step: Given I open url "https://playwright.dev"
  // From: features/homepage.feature:4:5
});

When('I click link {string}', async ({}, arg) => {
  // Step: When I click link "Get started"
  // From: features/homepage.feature:5:5
});

Then('I see in title {string}', async ({}, arg) => {
  // Step: Then I see in title "Playwright"
  // From: features/homepage.feature:6:5
});

Use the snippets above to create missing steps.
```

> В некоторых проектах фичи пишутся заранее, а определения шагов приходят позже. Для таких случаев вам может потребоваться разрешить генерацию тестовых файлов с отсутствующими шагами и отображать их как падающие (или fixme) сценарии. Ознакомьтесь с опцией [`missingSteps`](ru/configuration/options.md#missingsteps) для настройки этого поведения.
