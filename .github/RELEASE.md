# Releasing Playwright-BDD

Currently release is performed from the local machine.

1. push `main` branch to GitHub and wait all checks to pass
2. manually set new version in CHANGELOG.md, then run `git commit -am'changelog: bump xxx'`
3. `npm run release`
4. update playwright-bdd-example: `npm i -D playwright-bdd@latest`
5. merge `main` branch to `docs` to update documentation website:
  - `git co docs && git pull && git merge main && git push && git co main`
  - check docs: https://vitalets.github.io/playwright-bdd/
6. close relevant issues on GitHub by Changelog

## Releasing docs

The documentation website is generated from `*.md` files in the `./docs` directory using [Docsify](https://docsify.js.org/#/). 

- **Stable documentation**: Served from the `docs` branch. Push updates here to fix issues like typos.  
- **Upcoming features**: Documented in the `main` branch. Push changes here for features not yet released.