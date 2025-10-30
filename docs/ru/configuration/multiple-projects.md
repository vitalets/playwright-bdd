# Проекты
Вы можете использовать Playwright-BDD с несколькими [проектами Playwright](https://playwright.dev/docs/test-projects).

## Общие файлы фич

Если все проекты используют **один и тот же набор файлов фич**, вы можете определить единую опцию `testDir` на корневом уровне конфигурации:
```ts
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'feature/*.feature',
  steps: 'steps/**/*.ts',
});

export default defineConfig({
  testDir,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
```

## Разные файлы фич

Если проекты используют **разные файлы фич**, вы должны определить отдельный `testDir` для каждого проекта:
```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      name: 'project-one',
      testDir: defineBddConfig({
        outputDir: '.features-gen/one',
        features: 'project-one/*.feature',
        steps: 'project-one/steps/*.ts',
      }),
    },
    {
      name: 'project-two',
      testDir: defineBddConfig({
        outputDir: '.features-gen/two',
        features: 'project-two/*.feature',
        steps: 'project-two/steps/*.ts',
      }),
    },
  ],
});
```

?> Обратите внимание, что вы также должны установить уникальный `outputDir` для каждого проекта, чтобы избежать конфликтов.

Для удобства существует вспомогательная функция [`defineBddProject()`](ru/api.md#definebddproject). В дополнение к стандартной BDD конфигурации, она принимает имя проекта и автоматически устанавливает `outputDir` на основе этого имени. Функция возвращает объект `{ name, testDir }`, который может быть объединен в конфигурацию проекта с помощью оператора расширения.

```ts
import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';

export default defineConfig({
  projects: [
    {
      ...defineBddProject({
        name: 'project-one',
        features: 'project-one/*.feature',
        steps: 'project-one/steps/*.ts',
      }),
    },
    {
      ...defineBddProject({
        name: 'project-two',
        features: 'project-two/*.feature',
        steps: 'project-two/steps/*.ts',
      }),
    },
  ],
});
```

## Не-BDD проекты

Вы можете иметь не-BDD проекты в той же конфигурации Playwright. Просто убедитесь, что не-BDD проекты имеют свой собственный `testDir`. См. пример в разделе **Аутентификация** ниже.

## Аутентификация

При использовании отдельного не-BDD проекта [для аутентификации](https://playwright.dev/docs/auth#basic-shared-account-in-all-tests), важно явно установить `testDir` для него:

```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
});

export default defineConfig({
  testDir,
  projects: [
    {
      name: 'setup',
      testDir: './setup-steps', // <-- установите testDir для проекта setup
      testMatch: /setup\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});
```
