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

export
@Fixture<typeof test>({ name: 'todoPage3', tags: '@todoPage3' })
class TodoPage3 {
  constructor(private testInfo: TestInfo) {}

  @Given('decorator step')
  step() {
    logger.log(`${this.testInfo.title}: todoPage3 - decorator step`);
  }

  @Given('decorator step', { tags: 'not @todoPage3' })
  step2() {
    // this step should not be used, because it does not match anything:
    // (@todoPage3) and (not @todoPage3)
    logger.log(`${this.testInfo.title}: todoPage3 - decorator step`);
  }
}

/* inheritance */

export
@Fixture({ tags: '@todoPage4' })
class Base {
  constructor(protected testInfo: TestInfo) {}

  @Given('decorator step')
  step() {
    logger.log(`${this.testInfo.title}: todoPage4 - decorator step from base`);
  }
}

export
@Fixture<typeof test>('todoPage4')
class TodoPage4 extends Base {
  @Given('unique step of todoPage4')
  step2() {
    logger.log(`${this.testInfo.title}: todoPage4 - unique step`);
  }
}
