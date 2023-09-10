# Changelog

## dev
* Support feature level `@fixture:` tags.

## 5.2.0

* **possibly breaking:** Introduce `featuresRoot` option to have more control of generated files structure [#44](https://github.com/vitalets/playwright-bdd/issues/44).

  This fix actually reverts simplification of `outputDir` by common parent (added in v5, see [#40](https://github.com/vitalets/playwright-bdd/issues/40)).

  *❤️ I need to admit that automatic simplification of `outputDir` structure was not the right choice. Playwright heavily relies on tests structure for storing screenshots and we should keep it as stable as possible. I don't like such reverting but better to do it now than later. Introduced `featuresRoot` allows to strictly control output structure in the same way as TypeScript controls it with [rootDir](https://www.typescriptlang.org/tsconfig#rootDir).*

  *If you use screenshots/snapshots you may need to re-save them to new paths after upgrading.*

* Add CLI command `bddgen export`.
* New [documentation website](https://vitalets.github.io/playwright-bdd/#/).
* Suppress `publishQuiet` deprecation warning for Cucumber v9.4+, see [#47](https://github.com/vitalets/playwright-bdd/issues/47)

## 5.1.1
* Hotfix for output directory structure with tags filter, see [comment](https://github.com/vitalets/playwright-bdd/issues/36#issuecomment-1667819050)

## 5.1.0
* Add `--tags` option to filter scenarios by tags expression [#36](https://github.com/vitalets/playwright-bdd/issues/36).
* Add `bddgen env` command to display environment info.

## 5.0.1
There are several breaking changes in this release. Please check carefully after upgrade.
* **breaking:** Optimize world initialization, rename `World` -> `BddWorld`, `WorldOptions` -> `BddWorldOptions`.
  *If you use these classes you may need to rename it as well*
* **breaking:** Resolve paths relative to Playwright config file, not to `process.cwd()`.
  *If you use custom Playwright config file you may need to update paths in it*
* **breaking:** Simplify generated directories structure [#40](https://github.com/vitalets/playwright-bdd/issues/40).
  *If you use snapshots you may need to re-save them in new paths*
* Imporve support for several calls of `defineBddConfig()` [#39](https://github.com/vitalets/playwright-bdd/issues/39)
* Add config option `quotes` = `'single' | 'double' | 'backtick'` to control quotes style in generated tests [#34](https://github.com/vitalets/playwright-bdd/issues/34)

## 4.0.0
* Fix running several Playwright projects with shared steps [#32](https://github.com/vitalets/playwright-bdd/issues/32)
* Support decorators for defining steps [#35](https://github.com/vitalets/playwright-bdd/issues/35) (set minimal Playwright version to **1.33**)

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