# IDE integration
One of Playwright-bdd goals is to support all Playwright IDE integrations. It is the main reason for pre-generating test files as regular Playwright test files.

## VS Code

### Official Playwright extension
[Official Playwright extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) is supported. It automatically picks up generated test files from `.features-gen` directory. You run/debug tests by click:
  <img width="70%" src="https://user-images.githubusercontent.com/1473072/229162634-8a801f6e-8a79-407b-889b-7769f957896a.png">

### Cucumber (Gherkin) Full Support

!> If you have both extensions enabled `Cucumber (Gherkin) Full Support` and `Official Cucumber extension`, VS Code does not handle them correctly. Disable one of them.

[Cucumber (Gherkin) Full Support](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) is supported. Here is the recommended configuration in `.vscode/settings.json`:
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
You will get autocompletion of your steps and go to definition by click in feature files:
<img width="70%" src="https://user-images.githubusercontent.com/1473072/229165348-eae41fb8-0918-48ac-8644-c55a880860de.png">

### Official Cucumber extension

!> If you have both extensions enabled `Cucumber (Gherkin) Full Support` and `Official Cucumber extension`, VS Code does not handle them correctly. Disable one of them.

[Official Cucumber extension](https://marketplace.visualstudio.com/items?itemName=CucumberOpen.cucumber-official) is supported. You may need to configure locations of your features/steps.


## Intellij IDE / Aqua
Built-in Playwright support works as usual:
  <img width="70%" src="https://github.com/vitalets/playwright-bdd/assets/1473072/bf82dfdc-9797-44d0-b07c-185aea578174">

> You may need to set path to Playwright executable in [Run Configuration Template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#change-template) to avoid popup window before every test run
