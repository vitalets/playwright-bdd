# IDE integration
Playwright-bdd provides support for all Playwright IDE integrations, because generated test files are regular `js` files used by Playwright.

## VS Code

* [Playwright extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) works the usual way. You can click and run tests from `.features-gen` directory:
  <img width="70%" src="https://user-images.githubusercontent.com/1473072/229162634-8a801f6e-8a79-407b-889b-7769f957896a.png">

* [Cucumber autocomplete extension](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) works as usual:
  <img width="70%" src="https://user-images.githubusercontent.com/1473072/229165348-eae41fb8-0918-48ac-8644-c55a880860de.png">

## Intellij Idea / Aqua
Built-in Playwright support works as usual:
  <img width="70%" src="https://github.com/vitalets/playwright-bdd/assets/1473072/bf82dfdc-9797-44d0-b07c-185aea578174">

> You may need to set path to Playwright executable in [Run Configuration Template](https://www.jetbrains.com/help/idea/run-debug-configuration.html#change-template) to avoid popup window before every test run