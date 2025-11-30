# Игнорирование сгенерированных файлов

Сгенерированные тестовые файлы должны быть в `.gitignore`, так как они создаются из файлов `.feature`. Обратите внимание, что Playwright хранит снимки рядом с тестовыми файлами, поэтому вместо игнорирования всей директории `.features-gen`, лучше игнорировать только файлы `*.spec.js`:
```
**/.features-gen/**/*.spec.js
```

Другой вариант - установить [`snapshotPathTemplate`](https://playwright.dev/docs/api/class-testconfig#test-config-snapshot-path-template) в пользовательское расположение вне `.features-gen`. Например:
```ts
export default defineConfig({
  snapshotPathTemplate:
    '__snapshots__/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{-snapshotSuffix}{ext}',
  // ...
});
```
