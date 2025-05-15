<div align="center">
  <a href="https://vitalets.github.io/playwright-bdd">
    <img width="128" alt="playwright-bdd" src="./docs/logo.svg">
  </a>
</div>

<h2 align="center">Playwright-BDD</h2>

<div align="center">

[![lint](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml)
[![test](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/playwright-bdd)](https://www.npmjs.com/package/playwright-bdd)
[![npm downloads](https://img.shields.io/npm/dw/playwright-bdd)](https://www.npmjs.com/package/playwright-bdd)
[![license](https://img.shields.io/npm/l/playwright-bdd)](https://github.com/vitalets/playwright-bdd/blob/main/LICENSE)

</div>

<div align="center">

Run [BDD](https://cucumber.io/docs/bdd/) tests with [Playwright](https://playwright.dev/) runner

</div>

> [!TIP]
> Try out [Fix with AI](https://vitalets.github.io/playwright-bdd/#/guides/fix-with-ai) button in HTML reporters

## Why BDD?
In the era of AI, you can take [BDD](https://cucumber.io/docs/bdd/) approach to the next level:

- 🤖 **Generate**: Drop business requirements into an AI chat and instantly get feature files.
- ✅ **Validate**: Refine the generated scenarios with AI or colleagues, collaborate in plain text instead of code.
- 🛠 **Automate**: [Use existing steps](https://vitalets.github.io/playwright-bdd/#/writing-features/chatgpt) to run the tests and prevent codebase growth.

## Why Playwright Runner?

Both [Playwright](https://playwright.dev/) and [CucumberJS](https://github.com/cucumber/cucumber-js) have their own test runners. You can use the CucumberJS runner with [Playwright as a library](https://playwright.dev/docs/library) to execute BDD scenarios. This package offers **an alternative**: convert BDD scenarios into test files and run them directly with Playwright. You gain all the advantages of the Playwright runner:

- Automatic browser initialization and cleanup
- Auto-capture of screenshots, videos, and traces
- Parallelization with sharding
- Auto-waiting for page elements
- Built-in visual comparison testing
- Power of Playwright fixtures
- [...and more](https://playwright.dev/docs/library#key-differences)

## Extras
Playwright-BDD extends Playwright with BDD capabilities, offering:

- 🔥 Advanced tagging [by path](https://vitalets.github.io/playwright-bdd/#/writing-features/tags-from-path) and [special tags](https://vitalets.github.io/playwright-bdd/#/writing-features/special-tags)
- 🎩 [Step decorators](https://vitalets.github.io/playwright-bdd/#/writing-steps/decorators) for class methods  
- 🎯 [Scoped step definitions](https://vitalets.github.io/playwright-bdd/#/writing-steps/scoped)  
- ✨ [Exporting steps](https://vitalets.github.io/playwright-bdd/#/writing-features/chatgpt) for AI  
- ♻️ [Re-usable step functions](https://vitalets.github.io/playwright-bdd/#/writing-steps/reusing-step-fn)  

## Documentation
Check out the [documentation website](https://vitalets.github.io/playwright-bdd/#/).

## Examples
There are several examples in [`examples`](/examples) folder and a separate fully working repo [playwright-bdd-example](https://github.com/vitalets/playwright-bdd-example).

## Community
Feel free to get in touch:

* Open an [issue on GitHub](https://github.com/vitalets/playwright-bdd/issues) to report a bug or propose a new feature
* Join [Playwright-BDD Discord server](https://discord.gg/5rwa7TAGUr) to connect with other developers, ask questions and share your BDD experience

## Changelog
Check out the latest changes in the [CHANGELOG.md](https://github.com/vitalets/playwright-bdd/blob/main/CHANGELOG.md).

## Contributing
Your contributions are welcome! Please review [CONTRIBUTING.md](https://github.com/vitalets/playwright-bdd/blob/main/.github/CONTRIBUTING.md) for the details.

## Sponsors
Many thanks to our sponsors for their generous support ❤️ [Become a sponsor](https://github.com/sponsors/vitalets)

<!-- sponsors --><a href="https://github.com/currents-dev"><img src="https:&#x2F;&#x2F;github.com&#x2F;currents-dev.png" width="60px" alt="User avatar: Currents.dev" /></a><a href="https://github.com/jzaratei"><img src="https:&#x2F;&#x2F;github.com&#x2F;jzaratei.png" width="60px" alt="User avatar: " /></a><a href="https://github.com/alescinskis"><img src="https:&#x2F;&#x2F;github.com&#x2F;alescinskis.png" width="60px" alt="User avatar: Arturs Leščinskis" /></a><a href="https://github.com/kahuna227"><img src="https:&#x2F;&#x2F;github.com&#x2F;kahuna227.png" width="60px" alt="User avatar: " /></a><a href="https://github.com/alexhvastovich"><img src="https:&#x2F;&#x2F;github.com&#x2F;alexhvastovich.png" width="60px" alt="User avatar: " /></a><a href="https://github.com/FrancescoBorzi"><img src="https:&#x2F;&#x2F;github.com&#x2F;FrancescoBorzi.png" width="60px" alt="User avatar: Francesco Borzì" /></a><!-- sponsors -->

## How to make BDD valuable for my project?

Have a look on [this section](https://vitalets.github.io/playwright-bdd/#/faq?id=how-to-make-bdd-valuable-for-my-project).

## My other Playwright tools
* [request-mocking-protocol](https://github.com/vitalets/request-mocking-protocol) - Mock server-side API calls in Playwright.
* [playwright-network-cache](https://github.com/vitalets/playwright-network-cache) - Speed up Playwright tests by caching network requests on the filesystem.
* [playwright-magic-steps](https://github.com/vitalets/playwright-magic-steps) - Auto-transform JavaScript comments into Playwright steps.

## License
This project is licensed under the [MIT License](https://github.com/vitalets/playwright-bdd/blob/main/LICENSE), allowing you to use, modify, and share the code freely, even for commercial purposes. Enjoy building something amazing! 🎉