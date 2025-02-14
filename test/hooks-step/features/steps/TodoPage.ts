import { Given, Fixture } from 'playwright-bdd/decorators';
import { test } from './fixtures';
import { expect } from '@playwright/test';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  constructor(private log: (message: string) => unknown) {}

  @Given('decorator step {int}')
  step(n: number) {
    this.log(`decorator step ${n}`);
    expect(1).toBe(1);
  }
}
