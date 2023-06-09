# Changelog

## 3.3.0
* Fix getting location from stacktrace, [#31](https://github.com/vitalets/playwright-bdd/issues/31)
* Use built-in Playwright's loader for TS instead of `ts-node`, fixes [#27](https://github.com/vitalets/playwright-bdd/issues/27)

## 3.2.1
* Improve snippets

## 3.2.0
* Customize test titles for scenario outline [#29](https://github.com/vitalets/playwright-bdd/issues/29)
* Generate snippets for undefined steps [#17](https://github.com/vitalets/playwright-bdd/issues/17)

## 3.1.0
* Support Cucumber tags [#8](https://github.com/vitalets/playwright-bdd/issues/8)

## 3.0.2
* Fix slash in the generated import statement on windows [#26](https://github.com/vitalets/playwright-bdd/issues/26)
* Fix docs for custom fixtures [#25](https://github.com/vitalets/playwright-bdd/issues/25)
* Fix `--ui` mode [#24](https://github.com/vitalets/playwright-bdd/issues/24)
* Support `--verbose` CLI flag

## 3.0.1
Version v3 has several major updates based on the feedback.
Please check out updated [README.md](README.md) and feel free to report any issues.

* Added support of custom fixtures and playwright-style functions for step definitions [#11](https://github.com/vitalets/playwright-bdd/issues/11)
* Use single config file: embed Cucumber config into Playwright config [#4](https://github.com/vitalets/playwright-bdd/issues/4)
* Nice reporting: wrap each cucumber step in `test.step` [#22](https://github.com/vitalets/playwright-bdd/issues/22)
* Supported screenshots / snapshots persistance between test runs [#23](https://github.com/vitalets/playwright-bdd/issues/23)

## 2.2.0
* Run only one scenario / skip scenario [#14](https://github.com/vitalets/playwright-bdd/issues/14)
* Support "Scenario Template" keyword [#20](https://github.com/vitalets/playwright-bdd/issues/20)

## 2.1.0
* Support Gherkin i18n [#13](https://github.com/vitalets/playwright-bdd/issues/13)

## 2.0.0
* Support "Rule" keyword [#7](https://github.com/vitalets/playwright-bdd/issues/7)
* Generate test files close to Gherkin document structure [#10](https://github.com/vitalets/playwright-bdd/issues/10)

## 1.3.0
* Print parsing errors to the console while generating [#2](https://github.com/vitalets/playwright-bdd/issues/2)

## 1.2.0
* Initial public release