# Development

## Setup playwright-bdd locally
1. Fork [playwright-bdd](https://github.com/vitalets/playwright-bdd) repo
2. Clone your fork to the local machine
    ```
    git clone https://github.com/<YOU_NAME>/playwright-bdd.git
    ```
3. Install dependencies:
    ```
    cd playwright-bdd
    npm install
    ```
4. Install Playwright browsers:
    ```
    npx playwright install chromium
    ```

## Run tests
```
npm t
```

## Test on different Playwright version
Install needed Playwright version (without saving to `package.json`):
```
npm i --no-save @playwright/test@1.40 @playwright/experimental-ct-react@1.40
```

Install corresponding browsers without clearing other versions:
```
npx cross-env PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
```

Run tests:
```
npm run test
```

## Test on different Cucumber version
Install needed Cuucmber version (without saving to `package.json`):
```
npm i --no-save @cucumber/cucumber@10
```
Run tests:
```
npm run test
```

## Run particular test 
1. Replace `test(...)` with `test.only(...)` in `test/*/test.mjs`
2. Run only this test:
    ```
    npm run only
    ```
3. Run only this test in **debug mode** showing `STDOUT` and `STDERR`:
    ```
    npm run only:d
    ```