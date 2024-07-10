import { Fixture, When } from 'playwright-bdd/decorators';
import type { test } from './fixtures';
import { TodoPage } from './TodoPage';

export
@Fixture<typeof test>('adminTodoPage')
class AdminTodoPage extends TodoPage {
  @When('I remove todo {string}')
  async removeTodo(hasText: string) {
    const todo = this.todoItems.filter({ hasText });
    await todo.hover();
    await todo.getByRole('button', { name: 'Delete' }).click();
  }
}
