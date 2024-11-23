import { Given, Fixture } from 'playwright-bdd/decorators';
import { logger, test } from './fixtures';
import { TestInfo } from '@playwright/test';

export
@Fixture<typeof test>('todoPage')
class TodoPage {
  constructor(private testInfo: TestInfo) {}

  @Given('decorator step', { tags: '@todoPage' })
  step() {
    logger.log(`${this.testInfo.title}: todoPage - decorator step`);
  }
}

export
@Fixture<typeof test>('todoPage2')
class TodoPage2 {
  constructor(private testInfo: TestInfo) {}

  @Given('decorator step', { tags: '@todoPage2' })
  step() {
    logger.log(`${this.testInfo.title}: todoPage2 - decorator step`);
  }
}
