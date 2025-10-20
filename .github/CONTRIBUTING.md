# Contributing to Playwright-BDD

Thank you for considering contributing to Playwright-BDD 🎉 

## How can I contribute?

There are different ways to contribute:

### Write an article

We encourage you to share your experience with Playwright-BDD. BDD workflows vary widely from team to team, and your insights can be very helpful for community.  

Here are some good places to post:  
- [#playwright](https://dev.to/t/playwright) on dev.to
- [#software-testing](https://medium.com/tag/software-testing) on Medium 
- [articles](https://discord.com/channels/807756831384403968/1065556692357619793) on Playwright Discord
- [r/Playwright](https://www.reddit.com/r/Playwright/) on reddit
- LinkedIn, X.com, etc

### Report a bug or feature request
If you find a bug or have an idea for a feature:
1. Check if the issue already exists in the [Issues](https://github.com/vitalets/playwright-bdd/issues).
2. If not, create a new issue!

### Improve the docs
If you find a typo or an error in the [Playwright-BDD docs](https://vitalets.github.io/playwright-bdd/), feel free to provide a fix right in the GitHub interface:

1. Open the repo on the [`docs` branch](https://github.com/vitalets/playwright-bdd/tree/docs)
2. Navigate to the `docs` directory
3. Make your improvements in the `.md` files
4. Submit a pull request

### Contribute to the code

> When contributing a significant change, it's better to discuss it in the issues first.

1. Fork the [playwright-bdd](https://github.com/vitalets/playwright-bdd) repository.
2. Clone your fork to your local machine:
    ```bash
    git clone https://github.com/<YOUR_USERNAME>/playwright-bdd.git
    ```
3. Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b my-feature
    ```
4. Perform the [development setup](#development-setup)
5. Make and commit your changes.
6. Push the changes to your fork:
    ```bash
    git push origin my-feature
    ```
7. Open [a pull request](https://github.com/vitalets/playwright-bdd/pulls) to the `main` branch.

## Development setup

1. Navigate to the Playwright-BDD root directory:
    ```sh
    cd playwright-bdd
    ```

2. Install dependencies:
    ```sh
    npm install
    ```
3. Install Playwright browsers:
    ```sh
    npx playwright install chromium
    ```
4. Build project:
    ```
    npm run build
    ```
5. Run tests:
    ```sh
    npm t

    # run specific test
    npm run only test/<test-name-in-directory>
    ```
6. Run examples:
    ```sh
    npm run examples

    # run specific example
    npm run examples examples/<example-name-in-directory>
    ```
    Note: you may need to run `npm run examples` before commiting, as some pre-commit checks rely on its generated output.

## Useful dev commands

### Run a single test 
Use the command below (use TAB after typing `test/` to autocomplete the test path):
```
npm run only test/TEST_DIR_NAME
```
Example:
```
npm run only test/special-tags
```

### Switch Playwright version
This command will install the provided Playwright version without saving it to `package.json`:
```
npx cross-env PW=1.45 npm run pw
```

### Install Playwright browsers
This command will install `chromium` for the current Playwright version, without clearing previous browsers:
```
npm run pw:install
```

### Check deprecated Playwright versions
```
npm show @playwright/test@1 deprecated
```

### Clear Playwright compilation cache
```
npx playwright clear-cache
```