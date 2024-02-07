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
npx cross-env-shell PW=1.39 'npm i --no-save @playwright/test@$PW @playwright/experimental-ct-react@$PW'
```
OR
```
PW=1.39 npm run pw
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
Use the command below (use TAB after typing `test/` to autocomplete test path):
```
npm run only -- test/<%test-dir%>
```
Example:
```
npm run only -- test/reporter-cucumber-html
```