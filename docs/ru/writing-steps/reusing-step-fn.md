# Переиспользование функции шага

Можно переиспользовать функцию шага в других шагах для совместного использования общей функциональности. Сохраните возвращаемое значение `Given() / When() / Then()` и вызовите его в других шагах. Обратите внимание, что вы должны передать все требуемые фикстуры в первом аргументе.

Пример:
```ts
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

const createTodo = When('I create todo {string}', async ({ page }, text: string) => {
  await page.getByLabel('title').fill(text);
  await page.getByRole('button').click();
});

When('I create 2 todos {string} and {string}', async ({ page }, text1: string, text2: string) => {
  await createTodo({ page }, text1);
  await createTodo({ page }, text2);
});
```

#### Передача World

Для **шагов в стиле cucumber** вы должны вызвать функцию шага через `.call()`, чтобы передать фактический World:

```js
const createTodo = When('I create todo {string}', async function (text: string) {
  await this.page.getByLabel('title').fill(text);
  await this.page.getByRole('button').click();
});

When('I create 2 todos {string} and {string}', async function (text1: string, text2: string) {
  await createTodo.call(this, text1);
  await createTodo.call(this, text2);
});
```
