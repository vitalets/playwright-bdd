# Ignore generated files

Generated test files should be ignored by Git and Prettier as they are produced from `.feature`
files.

## `.gitignore`

Add generated specs, source maps, and the temporary generation lock file to the root `.gitignore`:

```bash
printf '\n%s\n' '**/.features-gen/**/*.spec.js' >> .gitignore
printf '\n%s\n' '**/.features-gen/**/*.spec.js.map' >> .gitignore
printf '\n%s\n' '**/.features-gen/.bddgen.lock' >> .gitignore
```

## `.prettierignore`

Add the generated spec and source-map rules to the root `.prettierignore` to prevent Prettier and
editor integrations from formatting generated files:

```bash
printf '\n%s\n' '**/.features-gen/**/*.spec.js' >> .prettierignore
printf '\n%s\n' '**/.features-gen/**/*.spec.js.map' >> .prettierignore
```

> Note that Playwright stores snapshot artifacts next to test files, that's why we ignore generated
> specs and source maps, not the whole `.features-gen` directory.
