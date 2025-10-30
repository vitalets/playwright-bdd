# Установка

Вы можете установить Playwright-BDD с помощью различных менеджеров пакетов:

- [с Npm](#npm)
- [с Pnpm](#pnpm)
- [с Yarn](#yarn)

## Npm

- **Новый проект или существующий проект без Playwright:**

    Установите Playwright и Playwright-BDD:
    ```
    npm i -D @playwright/test playwright-bdd
    ```

    Установите [браузеры](https://playwright.dev/docs/browsers) Playwright:
    ```
    npx playwright install
    ```

- **Существующий проект с Playwright:**

    Установите только Playwright-BDD:
    ```
    npm i -D playwright-bdd
    ```

Теперь вы можете начать [писать BDD тесты](ru/getting-started/write-first-test.md).

## Pnpm

- **Новый проект или существующий проект без Playwright:**

    Установите Playwright и Playwright-BDD:
    ```
    pnpm i -D @playwright/test playwright-bdd
    ```

    Установите [браузеры](https://playwright.dev/docs/browsers) Playwright:
    ```
    pnpm playwright install
    ```

- **Существующий проект с Playwright:**

    Установите только Playwright-BDD:
    ```
    pnpm i -D playwright-bdd
    ```

Теперь вы можете начать [писать BDD тесты](ru/getting-started/write-first-test.md).

## Yarn

**Важно**: Для [Yarn Plug'n'Play](https://yarnpkg.com/features/pnp) вам нужно добавить эти строки в `.yarnrc.yml`:

```yml
packageExtensions:
  playwright-bdd@*:
    dependencies:
      playwright: "*"
      playwright-core: "*"
```

Затем продолжите с установкой пакетов.

- **Новый проект или существующий проект без Playwright:**

    Установите Playwright и Playwright-BDD:
    ```
    yarn add -D @playwright/test playwright-bdd
    ```

    Установите [браузеры](https://playwright.dev/docs/browsers) Playwright:
    ```
    yarn playwright install
    ```

- **Существующий проект с Playwright:**

    Установите только Playwright-BDD:
    ```
    yarn add -D playwright-bdd
    ```

Теперь вы можете начать [писать BDD тесты](ru/getting-started/write-first-test.md).
