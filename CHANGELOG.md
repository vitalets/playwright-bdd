# Changelog

## 7.4.0
* support `skipAttachments` option in `html` and `message` reporters (related to [#182](https://github.com/vitalets/playwright-bdd/issues/182))
* revert `#` subpath imports to relative paths: consumers with `(module = commonjs) + (skipLibCheck = false)` can't compile the project ([#218](https://github.com/vitalets/playwright-bdd/issues/218))

## 7.3.0
* fix: skipped scenarios break cucumber reports ([#143](https://github.com/vitalets/playwright-bdd/issues/143))
* chore: update @cucumber/html-formatter ([#213](https://github.com/vitalets/playwright-bdd/issues/213))
* chore: use import subpath from package.json for internal imports
* chore: update dependencies

## 7.2.2
* fix: provide empty world for Playwright-style steps ([#208](https://github.com/vitalets/playwright-bdd/issues/208))
* fix: improve CLI output ([#206](https://github.com/vitalets/playwright-bdd/issues/206))

## 7.2.1
* fix: show snippets even if there are no step definitions found, ([#201](https://github.com/vitalets/playwright-bdd/issues/201))
* fix: unexpected Exit Code with cucumberReporter When Setup Fails, ([#200](https://github.com/vitalets/playwright-bdd/issues/200))
* chore: set module node16 in tsconfig, remove typesVersions and add types tests

## 7.1.2
* fix: check exported test variable for manual importTestFrom, ([#196](https://github.com/vitalets/playwright-bdd/issues/196))

## 7.1.1
* fix: improve error messages when guessing importTestFrom, ([#196](https://github.com/vitalets/playwright-bdd/issues/196))
* fix: bddgen env throws if there is no @cucumber/cucumber

## 7.1.0
* fix: access to $tags fixture in non-bdd project, ([#189](https://github.com/vitalets/playwright-bdd/issues/189))
* fix: make @retries:0 special tag work, ([#187](https://github.com/vitalets/playwright-bdd/issues/187))

## 7.0.1
* improvement: dropped dependency on `chalk` and `supports-color`.

## 7.0.0
* improvement: remove dependency on Cucumber runner, see all the details in [migration guide](), ([#136](https://github.com/vitalets/playwright-bdd/issues/136))
* improvement: support custom parameter types in decorator steps, ([#112](https://github.com/vitalets/playwright-bdd/issues/112))
* improvement: manual `importTestFrom` option is replaced with automatic detection and most likely can be removed from BDD configuration, ([#46](https://github.com/vitalets/playwright-bdd/issues/46))
* improvement: introduce new function `defineBddProject()` that makes it easier to configure BDD for Playwright projects, ([#169](https://github.com/vitalets/playwright-bdd/issues/169))
* chore: set minimal Playwright version to 1.35
* chore: set minimal Node.js version to 18

## 6.6.0
* bugfix: enable run of non-bdd projects, ([#166](https://github.com/vitalets/playwright-bdd/issues/166))

## 6.5.2
* bugfix: createBdd returns Cucumber-Style Typing when using Playwright-Style, ([#163](https://github.com/vitalets/playwright-bdd/issues/163))

## 6.5.1
* chore: improve esm example, ([#164](https://github.com/vitalets/playwright-bdd/issues/164))
* bug: Cucumber reporter accesses non-existent file ([#161](https://github.com/vitalets/playwright-bdd/issues/161))

## 6.5.0
* feature: added new cucumber-style approach

## 6.4.0
* refactor: apply `@timeout` and `@slow` in runtime
* bug: fix cucumber reporters on Win

## 6.3.1
* feature: support `_` in `@timeout` tag
* fix: support Playwright 1.44 and Cucumber 10.6
* fix: Cucumber reporter doesn't work for non BDD projects ([#143](https://github.com/vitalets/playwright-bdd/issues/143))

## 6.3.0
* improvement: set scenario timeout via `test.setTimeout` instead of anonymous describe ([#139](https://github.com/vitalets/playwright-bdd/issues/139))
* feature: add `@slow` special tag ([#138](https://github.com/vitalets/playwright-bdd/issues/138))
* improvement: relax rules for guessing fixtures in decorator steps, introduce new config option `statefulPoms` for more strict checks ([#102](https://github.com/vitalets/playwright-bdd/issues/102))

## 6.2.0
* feature: add `--version` cli flag ([#134](https://github.com/vitalets/playwright-bdd/issues/134))
* feature: show step locations in unused export and in duplicate steps error ([#113](https://github.com/vitalets/playwright-bdd/issues/113))
* feature: add `$step` fixture ([#133](https://github.com/vitalets/playwright-bdd/issues/133))
* feature: add experimental support of `steps` option (related to [#94](https://github.com/vitalets/playwright-bdd/issues/94))

## 6.1.1
* fix: support stacktrace for Cucumber 10.4

## 6.1.0
* feature: add new special tags ([#123](https://github.com/vitalets/playwright-bdd/issues/123), [#126](https://github.com/vitalets/playwright-bdd/issues/126))
* feature: support new Playwright tags ([#98](https://github.com/vitalets/playwright-bdd/issues/98))
* feature: add option `--unused-steps` to `bddgen export` ([#113](https://github.com/vitalets/playwright-bdd/issues/113))
* feature: show stdout / stderr in Cucumber reports ([#116](https://github.com/vitalets/playwright-bdd/issues/116))
* feature: call step from step ([#110](https://github.com/vitalets/playwright-bdd/issues/110))
* bug: getting testInfo._runAsStep is not a function after updating to Canary playwright ([#119](https://github.com/vitalets/playwright-bdd/issues/119))

## 6.0.3
* fix timeouts in Cucumber reporters, [#107](https://github.com/vitalets/playwright-bdd/issues/107)

## 6.0.2
* fix spec generation for feature file with background without scenarios, [#104](https://github.com/vitalets/playwright-bdd/issues/104)

## 6.0.1
* fix Cucumber reporters for non-default language

## 6.0.0
* support Cucumber reporters 🎉, [#9](https://github.com/vitalets/playwright-bdd/issues/9)
* update minimal Playwright version to 1.34
* refactor docs navigation, add sidebar groups
* improve docs per users' feedback, [#90](https://github.com/vitalets/playwright-bdd/issues/90), [#93](https://github.com/vitalets/playwright-bdd/issues/93)
* make imports in the generated files use `/` on win, [#91](https://github.com/vitalets/playwright-bdd/issues/91)

## 5.8.0
* support Playwright 1.42, [#96](https://github.com/vitalets/playwright-bdd/issues/96)

## 5.7.1
* support Cucumber 10.2

## 5.7.0
* support Cucumber 10.1, [#80](https://github.com/vitalets/playwright-bdd/issues/80)

## 5.6.0
* support component tests, [#57](https://github.com/vitalets/playwright-bdd/issues/57)
* generate skipped tests with empty body, [#73](https://github.com/vitalets/playwright-bdd/issues/73)
* allow outline scenario name to be used as an examples template, [#67](https://github.com/vitalets/playwright-bdd/issues/67)
* fix empty step locations for esm
* fix duplicate steps error message, [#74](https://github.com/vitalets/playwright-bdd/issues/74)

## 5.5.0
* add support for hooks, [#15](https://github.com/vitalets/playwright-bdd/issues/15)
* add support for custom fixtures in cucumber-style steps
* enrich html-report with keywords, [#69](https://github.com/vitalets/playwright-bdd/issues/69)
* fix snippets on win for cucumber@10, [#71](https://github.com/vitalets/playwright-bdd/issues/71)

## 5.4.0
* i18n: Generate scenario outlines correctly [#60](https://github.com/vitalets/playwright-bdd/issues/60).
* Check for duplicate fixture names [#52](https://github.com/vitalets/playwright-bdd/issues/52)
* Fix flushing logs for several projects [#59](https://github.com/vitalets/playwright-bdd/issues/59)
* Support Playwright `1.39`.
* Docs: add search.

## 5.3.0
* Add support for Playwright `1.38`.
* Fix output dir clear on Windows [#49](https://github.com/vitalets/playwright-bdd/issues/49)).
* Support feature level `@fixture:` tags [#52](https://github.com/vitalets/playwright-bdd/issues/52)).

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
* Improve support for several calls of `defineBddConfig()` [#39](https://github.com/vitalets/playwright-bdd/issues/39)
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
