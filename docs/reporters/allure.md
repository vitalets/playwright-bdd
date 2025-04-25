# Allure Reporter

You can output test results with the **allure-playwright** reporter (not `allure-cucumberjs`). Follow the instructions below:

1. [Install Allure](https://allurereport.org/docs/install/)

2. [Install Allure-Playwright](https://allurereport.org/docs/playwright/)

3. Enable `allure-reporter` in the Playwright config:

    ```js
    import { defineConfig } from '@playwright/test';
    import { defineBddConfig } from 'playwright-bdd';

    const testDir = defineBddConfig({ /* BDD config */ });

    export default defineConfig({
      testDir,
      reporter: 'allure-playwright', // <- enable allure reporter
    });
    ```

Now run tests as usual:
```
npx bddgen && npx playwright test
```

Example feature file:
```gherkin
Feature: Playwright Home Page

    Scenario: Check title
        Given I am on Playwright home page
        When I click link "Get started"
        Then I see in title "Installation"
```

Example report:
![Allure report](./_media/allure-report.png)
