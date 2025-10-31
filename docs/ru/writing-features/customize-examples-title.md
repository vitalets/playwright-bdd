# Настройка заголовков примеров
По умолчанию каждая строка примера из `Scenario Outline` преобразуется в тест с заголовком `Example #{index}`.
Это может быть ненадежным для репортеров, которые отслеживают историю тестов, потому что при каждой вставке или удалении строк заголовки тестов будут смещаться.

Существует три способа установить согласованный заголовок для примеров.

#### 1. Использовать имя сценария как шаблон
Вы можете добавить имена столбцов вроде `<column>` в имя сценария. В этом случае имя сценария будет использоваться как шаблон заголовка для сгенерированных примеров.

!> Обратите внимание, что сгенерированные заголовки должны быть **уникальными** в пределах сценария, иначе Playwright выдаст ошибку.

Пример:
```gherkin
Feature: Calculator

    Scenario Outline: Multiply <value> by two
      Given value is <value>
      When multiply by two
      Then result is <result>

      Examples:
        | value | result |
        | 1     | 2      |
        | 2     | 4      |
```

Сгенерированный тестовый файл:
```js
test.describe(`Calculator`, () => {

  test.describe(`Multiply <value> by two`, () => {

    test(`Multiply 1 by two`, async ({ Given, When, Then }) => {
      await Given(`value is 1`);
      await When(`multiply by two`);
      await Then(`result is 2`);
    });

    test(`Multiply 2 by two`, async ({ Given, When, Then }) => {
      await Given(`value is 2`);
      await When(`multiply by two`);
      await Then(`result is 4`);
    });

  });
});
```

#### 2. Использовать специальный синтаксис комментария
Вы можете предоставить свой собственный фиксированный формат заголовка, добавив специальный комментарий прямо над `Examples`.
Комментарий должен начинаться с `# title-format:` и может ссылаться на имена столбцов как `<column>`. Например:
```gherkin
Feature: Calculator

    Scenario Outline: Multiply by two
      Given value is <value>
      When multiply by two
      Then result is <result>

      # title-format: check <value>
      Examples:
        | value | result |
        | 1     | 2      |
        | 2     | 4      |
```

Сгенерированный тестовый файл:
```js
test.describe(`Calculator`, () => {

  test.describe(`Multiply by two`, () => {

    test(`check 1`, async ({ Given, When, Then }) => {
      await Given(`value is 1`);
      await When(`multiply by two`);
      await Then(`result is 2`);
    });

    test(`check 2`, async ({ Given, When, Then }) => {
      await Given(`value is 2`);
      await When(`multiply by two`);
      await Then(`result is 4`);
    });

  });
});
```

#### 3. Использовать опцию конфигурации
Вы можете установить опцию конфигурации [examplesTitleFormat](ru/configuration/options.md#examplestitleformat) для определения глобального шаблона заголовков примеров.
