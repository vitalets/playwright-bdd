# Ignore generated files
Generated test files should be in `.gitignore` as they are produced from `.feature` files.
Important note that Playwright stores snapshots next to test files, so
instead of ignoring the whole `.features-gen` directory you'd better ignore only `*.spec.js` files:
```
**/.features-gen/**/*.spec.js
```
Another option is to set [`snapshotPathTemplate`](https://playwright.dev/docs/api/class-testconfig#test-config-snapshot-path-template) to custom location out of `.features-gen`. For example:
```ts
export default defineConfig({
  snapshotPathTemplate:
    '__snapshots__/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}',
  // ...  
});
```