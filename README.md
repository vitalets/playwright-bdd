# playwright-bdd
[![lint](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml)
[![test](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/playwright-bdd)](https://www.npmjs.com/package/playwright-bdd)
[![npm downloads](https://img.shields.io/npm/dw/playwright-bdd)](https://www.npmjs.com/package/playwright-bdd)
[![license](https://img.shields.io/npm/l/playwright-bdd)](https://github.com/vitalets/playwright-bdd/blob/main/LICENSE)

Run [BDD](https://cucumber.io/docs/bdd/) tests with [Playwright](https://playwright.dev/) runner.

> Inspired by the issue in the Playwright repo [microsoft/playwright#11975](https://github.com/microsoft/playwright/issues/11975)

> [!TIP]
> **Playwright-bdd v7 is released!** Dropped Cucumber package dependency, simpler configuration and other improvements. [Try it out](https://vitalets.github.io/playwright-bdd/#/guides/migration-v7) and share the feedback!

## Why Playwright runner?
Both [Playwright](https://playwright.dev/) and [CucumberJS](https://github.com/cucumber/cucumber-js) have their own test runners. 
You can use CucumberJS runner with [Playwright as a library](https://medium.com/@manabie/how-to-use-playwright-in-cucumberjs-f8ee5b89bccc) to test BDD scenarios.
This package offers **an alternative way**: convert BDD scenarios into Playwright tests and run them with Playwright runner as usual. 
Such approach brings all the benefits of Playwright runner:

* Automatic browser initialization and cleanup
* Auto-capture of screenshots, videos and traces
* Parallelization with sharding
* Auto-waiting of page elements
* Out-of-box visual comparison testing
* Power of Playwright fixtures
* [...a lot more](https://playwright.dev/docs/library#key-differences)

## Extras
Some features were developed in `playwright-bdd` on top of Playwright and BDD approaches:

* [Decorator steps](https://vitalets.github.io/playwright-bdd/#/writing-steps/decorators)
* [Special tags](https://vitalets.github.io/playwright-bdd/#/writing-features/special-tags)
* [Calling step from step](https://vitalets.github.io/playwright-bdd/#/writing-steps/playwright-style?id=call-step-from-step)

## Documentation
Check out [documentation website](https://vitalets.github.io/playwright-bdd/#/).

## Examples
There are several examples in [`examples`](/examples) folder and a separate fully working repo [playwright-bdd-example](https://github.com/vitalets/playwright-bdd-example).

## Community
Let's make playwright-bdd awesome together!

* Open an [issue on GitHub](https://github.com/vitalets/playwright-bdd/issues) to report bug or propose new feature
* 🆕 Join [Playwright-bdd Discord Server](https://discord.gg/5rwa7TAGUr) to connect with other developers, ask questions and share your experience or showcase

## Changelog
Check out the latest changes in the [CHANGELOG.md](https://vitalets.github.io/playwright-bdd/#/changelog).

## Contributing
Your contributions are welcome! Review [DEVELOPMENT.md](https://github.com/vitalets/playwright-bdd/blob/main/DEVELOPMENT.md) for playwright-bdd local setup and development.

## Sponsors
Great thanks to the sponsors for supporting playwright-bdd project ❤️ [Become a sponsor](https://github.com/sponsors/vitalets)

<!-- sponsors --><a href="https://github.com/currents-dev"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;81007196?v&#x3D;4" width="60px" alt="Currents.dev" /></a><a href="https://github.com/jzaratei"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;47472889?u&#x3D;f9251d2b370555e93a0288db665dc75ecb26d9b2&amp;v&#x3D;4" width="60px" alt="" /></a><a href="https://github.com/NikkTod"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;94455079?u&#x3D;7dbd09bb31a22ae804b06cfd704bf38d302c6d72&amp;v&#x3D;4" width="60px" alt="" /></a><a href="https://github.com/alescinskis"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;29544469?u&#x3D;50a6ba94e760964df053762866c3aed21fcc21f2&amp;v&#x3D;4" width="60px" alt="Arturs Leščinskis" /></a><a href="https://github.com/kahuna227"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;41581871?v&#x3D;4" width="60px" alt="" /></a><a href="https://github.com/alexhvastovich"><img src="https:&#x2F;&#x2F;avatars.githubusercontent.com&#x2F;u&#x2F;25912757?v&#x3D;4" width="60px" alt="" /></a><!-- sponsors -->

## How to make BDD valuable for my project?

Have a look on [this section](https://vitalets.github.io/playwright-bdd/#/faq?id=how-to-make-bdd-valuable-for-my-project).

## My other Playwright tools
* [playwright-network-cache](https://github.com/vitalets/playwright-network-cache) - Speed up Playwright tests by caching network requests on filesystem.
* [playwright-magic-steps](https://github.com/vitalets/playwright-magic-steps) - Auto-transform JavaScript comments into Playwright steps.

## License
[MIT](https://github.com/vitalets/playwright-bdd/blob/main/LICENSE)