# Отладка

Вы можете использовать любые [методы отладки Playwright](https://playwright.dev/docs/debug) для BDD тестов.

## Запуск тестов с флагом `--debug`

Эта команда открывает браузер и позволяет выполнять пошаговую оценку:

```
npx bddgen && npx playwright test --debug
```

Пример скриншота:

![debug-flag](./../../guides/_media/debug-flag.png)

## Запуск тестов с флагом `--ui`

Эта команда запускает BDD тесты в UI режиме:

```
npx bddgen && npx playwright test --ui
```

Подробнее в [UI режиме](guides/ui-mode.md).
