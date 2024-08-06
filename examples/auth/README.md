# auth playwright-bdd example

Example of [single authentication account](https://playwright.dev/docs/auth#basic-shared-account-in-all-tests) in BDD tests. There are two Playwright projects:

* `auth` - non-BDD project for authentication
* `chromium` - BDD project that depends on `auth`

Features that don't need authentication are marked with `@noauth` tag and handled in `storageState` fixture.

If you need several accounts (that do not interact with each other), you can create several authentication states and select appropriate one by tag/feature in `storageState` fixture.

Authentication in this example is *static* - there are no steps like 
`Given I am logged in as "xxx@example.com"`. If you need dynamic authentication in steps, please check out [auth-in-steps]() example.