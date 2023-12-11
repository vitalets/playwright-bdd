# playwright-bdd
[![lint](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/lint.yaml)
[![test](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml/badge.svg)](https://github.com/vitalets/playwright-bdd/actions/workflows/test.yaml)
[![npm version](https://img.shields.io/npm/v/playwright-bdd)](https://www.npmjs.com/package/playwright-bdd)
[![license](https://img.shields.io/npm/l/playwright-bdd)](https://github.com/vitalets/playwright-bdd/blob/main/LICENSE)

Run [BDD](https://cucumber.io/docs/bdd/) tests with [Playwright](https://playwright.dev/) runner.

> Inspired by the issue in the Playwright repo [microsoft/playwright#11975](https://github.com/microsoft/playwright/issues/11975)

> 🔥 Check out [decorators syntax](https://vitalets.github.io/playwright-bdd/#/decorators) to define BDD steps right inside Page Object Models

## Why Playwright runner?
Both [Playwright](https://playwright.dev/) and [CucumberJS](https://github.com/cucumber/cucumber-js) have their own test runners. 
You can use CucumberJS runner with [Playwright as a library](https://medium.com/@manabie/how-to-use-playwright-in-cucumberjs-f8ee5b89bccc) to test BDD scenarios.
This package offers **an alternative way**: convert BDD scenarios into Playwright tests and run them with Playwright runner as usual. 
Such approach brings all the benefits of Playwright runner:

* Automatic browser initialization and cleanup
* Power of [Playwright fixtures](https://playwright.dev/docs/test-fixtures#with-fixtures)
* Out-of-box [screenshot testing](https://playwright.dev/docs/test-snapshots)
* Parallelization with [sharding](https://timdeschryver.dev/blog/using-playwright-test-shards-in-combination-with-a-job-matrix-to-improve-your-ci-speed#after)
* [...a lot more](https://playwright.dev/docs/library#key-differences)

## Documentation
Check out [documentation website](https://vitalets.github.io/playwright-bdd/#/).

## Example
Clone and play with [playwright-bdd-example](https://github.com/vitalets/playwright-bdd-example) repo.

## Feedback
Feel free to share your feedback in [issues](https://github.com/vitalets/playwright-bdd/issues).

## Changelog
Inspect the latest changes in the [CHANGELOG.md](https://vitalets.github.io/playwright-bdd/#/changelog).

## Contributing
Review the [DEVELOPMENT.md](https://github.com/vitalets/playwright-bdd/blob/main/DEVELOPMENT.md) for contributing.

## Sponsors
Great thanks to the sponsors for supporting playwright-bdd project ❤️ [Become a sponsor](https://github.com/sponsors/vitalets)

<!-- sponsors --><a href="https://github.com/currents-dev"><img src="https://github.com/currents-dev.png" width="60px" alt="Currents.dev" /></a><a href="https://github.com/jzaratei"><img src="https://github.com/jzaratei.png" width="60px" alt="" /></a><a href="https://github.com/alescinskis"><img src="https://github.com/alescinskis.png" width="60px" alt="Arturs Leščinskis" /></a><a href="https://github.com/kahuna227"><img src="https://github.com/kahuna227.png" width="60px" alt="" /></a><!-- sponsors -->

## How to make BDD valuable for my project?

Have a look on [this section](https://vitalets.github.io/playwright-bdd/#/faq?id=how-to-make-bdd-valuable-for-my-project).

## License
[MIT](https://github.com/vitalets/playwright-bdd/blob/main/LICENSE)