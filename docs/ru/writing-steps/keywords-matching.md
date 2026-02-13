# Сопоставление ключевых слов

По умолчанию ключевое слово определения шага (например, `Given` против `When` против `Then`) [не учитывается](https://cucumber.io/docs/gherkin/reference/#steps) при сопоставлении с шагами сценария.

Например, следующее определение с `Given`:
```js
Given('a step', () => { ... });
```
успешно соответствует любому из этих шагов:
```gherkin
Given a step
When a step
Then a step
```

В некоторых случаях вы можете захотеть ограничить такое поведение и требовать сопоставления ключевых слов в дополнение к паттерну шага. С версии **Playwright-BDD v8** вы можете включить это с помощью опции [`matchKeywords`](ru/configuration/options.md#matchkeywords):

```js
// playwright.config.js
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  matchKeywords: true,
  // ...
});

export default defineConfig({
  testDir,
});
```

Теперь, если вы запустите код из предыдущего примера, вы получите ошибку отсутствующего определения шага:
```
Missing step definitions: 1

When('a step', async ({}) => {
  // Step: When a step
  // From: features/homepage.feature:4:5
});

Use snippets above to create missing steps.
```

#### Правила `matchKeywords: true`
1. Если шаг сценария начинается с `Given`, `When`, `Then` → он соответствует только определениям с соответствующим ключевым словом или универсальной функцией `Step`.
2. Если шаг сценария начинается с `And` / `But` → он ищет ближайшее полное ключевое слово (`Given, When, Then`) и следует правилу 1. Если это первый шаг сценария, он трактуется как `Given`.
3. Если шаг сценария начинается с `*` → он соответствует любому ключевому слову.
