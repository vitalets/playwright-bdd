# Репортер Allure

Вы можете выводить результаты тестов с помощью репортера **allure-playwright** (не `allure-cucumberjs`). Следуйте инструкциям ниже:

1. [Установите Allure](https://allurereport.org/docs/install/)

2. [Установите Allure-Playwright](https://allurereport.org/docs/playwright/)

3. Включите `allure-reporter` в конфигурации Playwright:

    ```js
    import { defineConfig } from '@playwright/test';
    import { defineBddConfig } from 'playwright-bdd';

    const testDir = defineBddConfig({ /* BDD config */ });

    export default defineConfig({
      testDir,
      reporter: 'allure-playwright', // <- включите репортер allure
    });
    ```

Теперь запустите тесты как обычно:
```
npx bddgen && npx playwright test
```

Пример файла фичи:
```gherkin
Feature: Playwright Home Page

    Scenario: Check title
        Given I am on Playwright home page
        When I click link "Get started"
        Then I see in title "Installation"
```

Пример отчета:
![Allure report](./../../reporters/_media/allure-report.png)
