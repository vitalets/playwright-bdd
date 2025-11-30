# Написание шагов

*Определения шагов* содержат код реализации шагов сценария.
Обычно они определяются с помощью функций `Given()`, `When()`, `Then()`.
Существует 3 способа написания шагов в Playwright-BDD:

1. [Стиль Playwright](ru/writing-steps/playwright-style.md) - пишите шаги так же, как пишете тесты Playwright, рекомендуется для новых BDD проектов или существующих проектов Playwright.
2. [Стиль Cucumber](ru/writing-steps/cucumber-style.md) - пишите шаги совместимым с CucumberJS способом, используйте `this` для доступа к world и фикстурам Playwright. Рекомендуется для миграции проектов CucumberJS на раннер Playwright.
3. [Декораторы](ru/writing-steps/decorators.md) - помечайте методы классов POM как шаги, рекомендуется для всех проектов.

#### Базовые примеры стилей шагов

Шаг в стиле Playwright:
```ts
Given('I open page {string}', async ({ page }, url: string) => {
  await page.goto(url);
});
```

Шаг в стиле Cucumber:
```ts
Given('I open page {string}', async function (url: string) => {
  await this.page.goto(url);
});
```

Декораторы:
```ts
class TodoPage {
  @Given('I open page {string}')
  async open(url: string) {
    await this.page.goto(url);
  }
}
```

Ознакомьтесь с соответствующими разделами, чтобы узнать больше о каждом стиле.

?> Обратите внимание, что нет функций `And()` / `But()`, так как эти ключевые слова используются только для лучшей семантики в файлах `.feature`.
