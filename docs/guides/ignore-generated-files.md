# Ignore generated files

Generated test files should be ignored by Git and Prettier as they are produced from `.feature` files.

## `.gitignore`

Add generated specs to the root `.gitignore`:

```bash
printf '\n%s\n' '**/.features-gen/**/*.spec.js' >> .gitignore
```

## `.prettierignore`

Add the generated spec rule to the root `.prettierignore` to prevent Prettier and editor integrations from formatting generated files:

```bash
printf '\n%s\n' '**/.features-gen/**/*.spec.js' >> .prettierignore
```

> Note that Playwright stores snapshot artifacts next to test files, that's why we ignore generated specs, not the whole `.features-gen` directory.
