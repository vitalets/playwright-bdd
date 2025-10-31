# Конфигурация

Конфигурация передается в `defineBddConfig()` внутри файла конфигурации Playwright.
Возвращаемое значение `defineBddConfig()` — это разрешенная выходная директория, где будут сгенерированы тестовые файлы. Удобно использовать её в качестве опции `testDir` для Playwright.

Пример конфигурации в `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'feature/*.feature',
  steps: 'steps/**/*.ts',
  // ...другие опции playwright-bdd
});

export default defineConfig({
  testDir,
});
```

Все относительные пути разрешаются от расположения файла конфигурации.
