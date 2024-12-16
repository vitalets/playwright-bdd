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
> :fire: [What's new in Playwright-BDD v8](https://vitalets.github.io/playwright-bdd/#/blog/whats-new-in-v8)

## Why Playwright runner?
Both [Playwright](https://playwright.dev/) and [CucumberJS](https://github.com/cucumber/cucumber-js) have their own test runners. 
You can use CucumberJS runner with [Playwright as a library](https://playwright.dev/docs/library) to test BDD scenarios.
This package offers **an alternative way**: convert BDD scenarios into Playwright test files and run them with Playwright runner. Such approach brings all the benefits of Playwright runner:

* Automatic browser initialization and cleanup
* Auto-capture of screenshots, videos and traces
* Parallelization with sharding
* Auto-waiting of page elements
* Out-of-box visual comparison testing
* Power of Playwright fixtures
* [...a lot more](https://playwright.dev/docs/library#key-differences)

## Extras
Some features were developed in Playwright-BDD on top of Playwright and BDD approaches:

* 🔥 Advanced tagging [by path](https://vitalets.github.io/playwright-bdd/#/writing-features/tags-from-path) and [special tags](https://vitalets.github.io/playwright-bdd/#/writing-features/special-tags)
* 🎩 [Step decorators](https://vitalets.github.io/playwright-bdd/#/writing-steps/decorators) for class methods
* 🎯 [Scoped step definitions](https://vitalets.github.io/playwright-bdd/#/writing-steps/scoped)
* ✨ [Export steps](https://vitalets.github.io/playwright-bdd/#/writing-features/chatgpt) for AI
* ♻️ [Re-using step functions](https://vitalets.github.io/playwright-bdd/#/writing-steps/reusing-step-fn)

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
Huge thanks to the sponsors of the Playwright-BDD project ❤️ [Become a sponsor](https://github.com/sponsors/vitalets)

<!-- sponsors --><a href="https://github.com/currents-dev"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;81007196?v&#x3D;4" width="60px" alt="Currents.dev" /></a><a href="https://github.com/jzaratei"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;47472889?u&#x3D;f9251d2b370555e93a0288db665dc75ecb26d9b2&amp;v&#x3D;4" width="60px" alt="" /></a><a href="https://github.com/NikkTod"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;94455079?u&#x3D;7dbd09bb31a22ae804b06cfd704bf38d302c6d72&amp;v&#x3D;4" width="60px" alt="" /></a><a href="https://github.com/alescinskis"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;29544469?u&#x3D;50a6ba94e760964df053762866c3aed21fcc21f2&amp;v&#x3D;4" width="60px" alt="Arturs Leščinskis" /></a><a href="https://github.com/kahuna227"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;41581871?v&#x3D;4" width="60px" alt="" /></a><a href="https://github.com/alexhvastovich"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;25912757?v&#x3D;4" width="60px" alt="" /></a><a href="https://github.com/FrancescoBorzi"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;75517?u&#x3D;dc770c4410108855e21654a962327708a80d6c1a&amp;v&#x3D;4" width="60px" alt="Francesco Borzì" /></a><a href="https://github.com/cassus"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;316826?v&#x3D;4" width="60px" alt="Adam Banko" /></a><!-- sponsors -->

## How to make BDD valuable for my project?

Have a look on [this section](https://vitalets.github.io/playwright-bdd/#/faq?id=how-to-make-bdd-valuable-for-my-project).

## My other Playwright tools
* [playwright-network-cache](https://github.com/vitalets/playwright-network-cache) - Speed up Playwright tests by caching network requests on the filesystem.
* [playwright-magic-steps](https://github.com/vitalets/playwright-magic-steps) - Auto-transform JavaScript comments into Playwright steps.

## License
[MIT](https://github.com/vitalets/playwright-bdd/blob/main/LICENSE)