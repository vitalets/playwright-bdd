# ESM

Your project runs in [ESM](https://nodejs.org/api/esm.html) if:
 * `package.json` contains `"type": "module"`
 * `tsconfig.json` contains `"module": "ESNext"`

For ESM you should use `import` instead of `require` in `defineBddConfig()`:

```diff
const testDir = defineBddConfig({,
-  require: ['steps/*.ts'],
+  import: ['steps/*.ts'],
});
```

And use [`ts-node/esm`](https://github.com/TypeStrong/ts-node#native-ecmascript-modules) loader to run tests:
```
NODE_OPTIONS='--loader ts-node/esm --no-warnings' npx bddgen && npx playwright test
```

You can check out a fully working ESM project in [this example](https://github.com/vitalets/playwright-bdd/tree/main/examples/esm).