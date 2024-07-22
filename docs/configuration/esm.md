# ESM

Your project runs in [ESM](https://nodejs.org/api/esm.html) if:
 * `package.json` contains `"type": "module"`
 * `tsconfig.json` contains `"module": "ESNext"`

Since playwright-bdd **v7** and Playwright **v1.41** you don't need to use `--loader ts-node/esm` for ESM projects. Just run as usual:
```
npx bddgen && npx playwright test
```

You can check out a fully working ESM project in [examples](https://github.com/vitalets/playwright-bdd/tree/main/examples/esm).