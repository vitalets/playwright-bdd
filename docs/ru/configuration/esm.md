# ESM

Ваш проект работает в [ESM](https://nodejs.org/api/esm.html), если:
 * `package.json` содержит `"type": "module"`
 * `tsconfig.json` содержит `"module": "ESNext"`

С версии Playwright-BDD **v7** и Playwright **v1.41** вам не нужно использовать `--loader ts-node/esm` для ESM проектов. Просто запускайте как обычно:
```
npx bddgen && npx playwright test
```

Вы можете ознакомиться с полностью рабочим ESM проектом в [примерах](https://github.com/vitalets/playwright-bdd/tree/main/examples/esm).
