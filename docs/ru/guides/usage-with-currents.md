# Использование с Currents

Вы можете интегрировать Playwright-BDD тесты с дашбордом [Currents](https://currents.dev/).

#### 1. [Зарегистрируйтесь](https://app.currents.dev/signup) в Currents и создайте новый проект
Обратитесь к [инструкции по настройке Playwright](https://docs.currents.dev/getting-started/playwright/you-first-playwright-run) в случае каких-либо проблем.

#### 2. Установите зависимости
Выполните следующую команду для установки репортера Currents + Playwright:
```sh
npm i -D @currents/playwright
```
Установите [dotenv](https://www.npmjs.com/package/dotenv) для управления учетными данными Currents:
```sh
npm i -D dotenv
```

#### 3. Настройте учетные данные
Создайте файл `.env` со следующими переменными:
```
CURRENTS_RECORD_KEY=YOUR_RECORD_KEY # ключ записи из https://app.currents.dev
CURRENTS_PROJECT_ID=YOUR_PROJECT_ID # projectId из https://app.currents.dev
```

#### 4. Настройте конфигурацию Playwright

В конфигурационном файле Playwright `playwright.config.ts` настройте репортер Currents:

```ts
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { CurrentsConfig, currentsReporter } from '@currents/playwright';

const currentsConfig: CurrentsConfig = {
  recordKey: process.env.CURRENTS_RECORD_KEY || '',
  projectId: process.env.CURRENTS_PROJECT_ID || '',
};

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/steps/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [currentsReporter(currentsConfig)],
  use: {
    screenshot: 'on',
    trace: 'on',
  },
});
```

#### 5. Запустите тесты
```
npx bddgen && npx playwright test
```

Проверьте результаты в [дашборде Currents](https://app.currents.dev/):

![Currents dashboard](./../../guides/_media/currents.png)

> Вот [полностью рабочий пример с Currents](https://github.com/vitalets/playwright-bdd-example/tree/currents).
