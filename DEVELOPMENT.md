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

## Run single test 
Use the command below (use TAB after typing `test/` to autocomplete test path):
```
npm run only test/<%test-dir%>
```
Example:
```
npm run only test/bdd-syntax
```

## Run tests on different Playwright version
Install needed Playwright version:
```
npx cross-env PW=1.39 npm run pw
```

Install corresponding browsers without clearing other versions:
```
npx cross-env PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium
```

Run tests:
```
npm t
```

## Run tests on different Cucumber version
Install needed Cucumber version (without saving to `package.json`):
```
npm i --no-save @cucumber/cucumber@10
```
Run tests:
```
npm t
```