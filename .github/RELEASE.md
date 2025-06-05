# Releasing Playwright-BDD

Currently release is performed from the local machine.

1. push `main` branch to GitHub and wait all checks to pass
2. `npm run release`
3. update playwright-bdd-example: `npm i -D playwright-bdd@latest`
4. merge `main` branch to `docs` to update documentation website:
  - `git co docs && git pull && git merge main && git push && git co main`
  - check docs: https://vitalets.github.io/playwright-bdd/
5. close relevant issues on GitHub by Changelog

## Releasing `next` tag

To preview upcoming features, it's possible to release the current commit as a `next` tag.

1. `npm run release`
2. select `prepatch / preminor / prerelease` in the versions dialog
3. select `next` tag

To install the next version, run:
```sh
npm i -D playwright-bdd@next
```

## Releasing docs

The documentation website is generated from `*.md` files in the `./docs` directory using [Docsify](https://docsify.js.org/#/). 

- **Stable documentation**: Served from the `docs` branch. Push updates here to fix issues like typos.  
- **Upcoming features**: Documented in the `main` branch. Push changes here for features not yet released.