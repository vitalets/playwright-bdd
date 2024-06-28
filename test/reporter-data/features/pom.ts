import { Page } from '@playwright/test';
import { Fixture, Given } from 'playwright-bdd/decorators';
import type { test } from './fixtures';

export
@Fixture<typeof test>('myPage')
class MyPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('https://example.com');
  }

  @Given('decorator step')
  async step() {}
}
