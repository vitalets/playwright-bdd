# Component tests

!> Component tests are not supported yet.

The experimental `@playwright/experimental-ct-*` packages were removed in Playwright 1.63. Playwright now provides framework-agnostic component testing through the built-in `mount` fixture and a user-owned story gallery. This new approach has not yet been validated with Playwright-BDD.

See the [Playwright component testing guide](https://playwright.dev/docs/test-components) and [playwright-bdd#331](https://github.com/vitalets/playwright-bdd/issues/331) for details.

?> **Alternative solution:** serve component variations via [Storybook](https://storybook.js.org/) and run Playwright-BDD tests against those pages.
