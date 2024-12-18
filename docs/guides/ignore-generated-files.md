# Ignore generated files

Generated test files should be in `.gitignore` as they are produced from `.feature` files. Note that Playwright stores snapshots next to test files, so instead of ignoring the whole `.features-gen` directory, it's better to ignore only `*.spec.js` files:
```
**/.features-gen/**/*.spec.js
```

Another option is to set [`snapshotPathTemplate`](https://playwright.dev/docs/api/class-testconfig#test-config-snapshot-path-template) to a custom location outside of `.features-gen`. For example:
```ts
export default defineConfig({
  snapshotPathTemplate:
    '__snapshots__/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}',
  // ...  
});
```