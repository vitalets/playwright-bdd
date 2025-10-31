# Репортеры Playwright

Все [репортеры Playwright](https://playwright.dev/docs/test-reporters) поддерживаются из коробки. Они менее адаптированы под BDD, но содержат все последние возможности отчетности Playwright.

Пример включения HTML репортера Playwright:
```js
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({ /* BDD config */ });

export default defineConfig({
  testDir,
  reporter: 'html', // <- определите репортер как обычно
});
```

Файл фичи:
```gherkin
Feature: Playwright Home Page

    Scenario: Check title
        Given I am on Playwright home page
        When I click link "Get started"
        Then I see in title "Installation"
```

Отчет:
![Playwright html report](./../../reporters/_media/pw-html-report.png)

Если вам нужны более адаптированные под BDD отчеты, ознакомьтесь с [репортерами Cucumber](reporters/cucumber.md).

