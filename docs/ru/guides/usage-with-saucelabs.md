# Использование с SauceLabs

Вы можете запускать Playwright-BDD тесты в облаке на платформе [SauceLabs](https://saucelabs.com/).

#### 1. Установите `saucectl`
```
npm install -g saucectl
```

#### 2. Настройте учетные данные Sauce Labs
Предоставьте ваше имя пользователя и ключ доступа Sauce Labs [username and access key](https://app.saucelabs.com/user-settings) следующей команде:
```
saucectl configure
```

#### 3. Добавьте конфигурацию Sauce Labs
Добавьте [конфигурацию](https://docs.saucelabs.com/web-apps/automated-testing/playwright/yaml/) Sauce Labs в `.sauce/config.yml`:
```yaml
apiVersion: v1alpha
kind: playwright
sauce:
  region: us-west-1
  concurrency: 10
  metadata:
    tags: [e2e, bdd]
playwright:
  version: package.json
npm:
  packages:
    playwright-bdd: latest
rootDir: ./
suites:
  - name: 'Chromium Mac'
    platformName: 'macOS 12'
    screenResolution: '1440x900'
    testMatch: ['.*.js']
    params:
      browserName: 'chromium'
      project: 'chromium' # Запускает проект, определенный в `playwright.config.js`
reporters:
  spotlight:
    enabled: true
```

#### 4. Настройте конфигурацию Playwright

В конфигурационном файле Playwright `playwright.config.ts` проверьте переменную окружения `process.env.SAUCE_VM` и установите правильные опции репортера:

```ts
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'features/steps/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [
    process.env.SAUCE_VM // поместить отчет в __assets__ при запуске на SauceLabs
      ? [ 'html', { open: 'never', outputFolder: '__assets__/html-report/', attachmentsBaseURL: './' } ]
      : [ 'html', { open: 'never' } ],
  ],
  use: {
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium', // использовать имя проекта 'chromium', как определено в '.sauce/config.yml'
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

#### 5. Игнорируйте ненужные файлы при загрузке Sauce Labs
Добавьте файл `.sauceignore` со следующими путями:
```
# This file instructs saucectl to not package any files mentioned here.

.git/
.github/
.DS_Store
.hg/
.vscode/
.idea/
.gitignore
.hgignore
.gitlab-ci.yml
.npmrc
\*.gif

# Remove this to have node_modules uploaded with code
node_modules/
```

#### 6. Запустите тесты
```
npx bddgen && saucectl run
```

Проверьте результаты тестов в [дашборде Sauce Labs](https://app.saucelabs.com/dashboard/builds/vdc):

![Sauce Labs dashboard](./../../guides/_media/saucelabs.png)

> Вот [полностью рабочий пример с SauceLabs](https://github.com/vitalets/playwright-bdd-example/tree/saucelabs).

## Ограничения

* Ознакомьтесь с [ограничениями](https://docs.saucelabs.com/web-apps/automated-testing/playwright/limitations/) Sauce Labs для Playwright
* BDD шаги не отображаются в репортере Sauce Labs, см. [sauce-docs#3059](https://github.com/saucelabs/sauce-docs/issues/3059)
