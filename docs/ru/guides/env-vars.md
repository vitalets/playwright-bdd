# Переменные окружения

Вы можете использовать переменные окружения внутри определений шагов:
```js
When('I log in', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Username' }).fill(process.env.USERNAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
});
```

Фактические значения могут быть предоставлены через файл `.env`, импортированный в `playwright.config.ts` с помощью пакета [dotenv](https://github.com/motdotla/dotenv):

```
# .env
USERNAME=foo
PASSWORD=bar
```

```ts
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

import 'dotenv/config'; // <-- заполнить переменные окружения из .env

const testDir = defineBddConfig({
  // ...
});

export default defineConfig({
  // ...
});
```

Альтернативно, вы можете передать переменные окружения напрямую в CLI команду.
Важный аспект - как правильно это сделать.

Следующее **не будет работать**:
```sh
USERNAME=foo npx bddgen && npx playwright test
```

Проблема в том, что `USERNAME` передается в `npx bddgen`, но не в `npx playwright test`.

Самый простой способ исправить это - поместить всю команду в npm скрипт в `package.json`:
```diff
"scripts": {
+   "test": "npx bddgen && npx playwright test",
},
```
А затем запустить как:
```sh
USERNAME=foo npm test
```

Или вы можете предоставить переменные окружения для всей команды с помощью пакета [cross-env](https://github.com/kentcdodds/cross-env):

```sh
npx cross-env-shell USERNAME=foo "npx bddgen && npx playwright test"
```
