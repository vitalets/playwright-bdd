# Интеграция с IDE

Одна из целей Playwright-BDD - поддержка всех интеграций Playwright с IDE. Это главная причина для предварительной генерации тестовых файлов как обычных тестовых файлов Playwright.

## VS Code

### Официальное расширение Playwright
[Официальное расширение Playwright](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) поддерживается. Оно автоматически подхватывает сгенерированные тестовые файлы из директории `.features-gen`. Вы можете запускать/отлаживать тесты кликом:
  <img width="70%" src="https://user-images.githubusercontent.com/1473072/229162634-8a801f6e-8a79-407b-889b-7769f957896a.png">

### Cucumber (Gherkin) Full Support

!> Если у вас включены оба расширения `Cucumber (Gherkin) Full Support` и `Official Cucumber extension`, VS Code не обрабатывает их корректно. Отключите одно из них.

[Cucumber (Gherkin) Full Support](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) поддерживается. Вот рекомендуемая конфигурация в `.vscode/settings.json`:
```json
{
  "cucumberautocomplete.steps": ["features/steps/*.{ts,js}"],
  "cucumberautocomplete.strictGherkinCompletion": false,
  "cucumberautocomplete.strictGherkinValidation": false,
  "cucumberautocomplete.smartSnippets": true,
  "cucumberautocomplete.onTypeFormat": true,
  "editor.quickSuggestions": {
    "comments": false,
    "strings": true,
    "other": true
  },
}
```
Вы получите автодополнение ваших шагов и переход к определению по клику в файлах фичей:
<img width="70%" src="https://user-images.githubusercontent.com/1473072/229165348-eae41fb8-0918-48ac-8644-c55a880860de.png">

### Официальное расширение Cucumber

!> Если у вас включены оба расширения `Cucumber (Gherkin) Full Support` и `Official Cucumber extension`, VS Code не обрабатывает их корректно. Отключите одно из них.

[Официальное расширение Cucumber](https://marketplace.visualstudio.com/items?itemName=CucumberOpen.cucumber-official) поддерживается. Возможно, вам потребуется настроить расположение ваших фичей/шагов.


## Intellij IDE / Aqua
Встроенная поддержка Playwright работает как обычно:
  <img width="70%" src="https://github.com/vitalets/playwright-bdd/assets/1473072/bf82dfdc-9797-44d0-b07c-185aea578174">

> Возможно, вам потребуется установить путь к исполняемому файлу Playwright в [Run Configuration Template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#change-template), чтобы избежать всплывающего окна перед каждым запуском теста
