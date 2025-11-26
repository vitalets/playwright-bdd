# Releasing Playwright-BDD

Currently release is performed from the local machine.

1. Push `main` branch to GitHub and wait all checks to pass.
2. Manually run [publish.yml](https://github.com/vitalets/playwright-bdd/actions/workflows/publish.yml) workflow.
3. Update playwright-bdd-example: `npm i -D playwright-bdd@latest`, run `npm test` to ensure tests pass.
4. close relevant issues on GitHub by the changelog.

## Releasing the docs

The documentation website is generated from `*.md` files in the `./docs` directory using [Docsify](https://docsify.js.org/#/). 

- **Stable documentation**: Served from the `docs` branch. Push updates there to instantly fix documentation issues (like typos).  
- **Upcoming features**: Documented in the `main` branch. Push changes here for features not yet released.

How to update the docs:

1. Pull the `main` branch
2. Merge it to the `docs` branch
3. Push the `docs` branch 

All-in-one command:
```
git checkout main \
&& git pull \
&& git checkout docs \
&& git pull \
&& git merge main -m'merge main' \
&& git push \
&& git checkout main
```

Then check the documenation website: https://vitalets.github.io/playwright-bdd/