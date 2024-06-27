import { Page } from '@playwright/test';
import { Fixture, Given } from 'playwright-bdd/decorators';
import type { test } from './fixtures';

@Fixture<typeof test>('myPage')
export class MyPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('https://example.com');
  }

  @Given('decorator step')
  async step() {}
}
