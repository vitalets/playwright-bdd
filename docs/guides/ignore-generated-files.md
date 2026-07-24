# Ignore generated files

Generated test files should be in `.gitignore` and `.prettierignore` as they are produced from `.feature` files:
```bash
printf '\n%s\n' '**/.features-gen/**/*.spec.js' >> .gitignore
printf '\n%s\n' '**/.features-gen/**/*.spec.js' >> .prettierignore
```

> Note that Playwright stores snapshot artifacts next to test files, that's why we ignore only `*.spec.js` files, not the whole `.features-gen` directory.
