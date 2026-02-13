# UI режим и отслеживание изменений

Вы можете автоматически перегенерировать тестовые файлы при любом изменении в фичах или определениях шагов. Используйте [nodemon](https://github.com/remy/nodemon) для отслеживания директорий и вызова `npx bddgen`:
```
npx nodemon -w ./features -w ./steps -e feature,js,ts --exec "npx bddgen"
```

Для отладки тестов в [UI режиме](https://playwright.dev/docs/test-ui-mode), запустите приведенную выше команду вместе с `npx playwright test --ui`. Вы можете использовать пакет [npm-run-all](https://github.com/mysticatea/npm-run-all) для этого. Пример `package.json`:

```json
"scripts": {
  "watch:bdd": "nodemon -w ./features -w ./steps -e feature,js,ts --exec \"npx bddgen\"",
  "watch:pw": "playwright test --ui",
  "watch": "run-p watch:*"
}
```
Запуск:
```sh
npm run watch
```

![ui-mode](./../../guides/_media/ui-mode.png)
