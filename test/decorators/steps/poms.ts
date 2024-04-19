import { Given, Fixture } from 'playwright-bdd/decorators';
import { test } from './fixtures';

// notice: no @Fixture here
class BasePage {
  constructor(public usedFixtures: string[]) {}

  @Given('BasePage: step')
  step() {
    this.usedFixtures.push(this.constructor.name);
  }
}

export
@Fixture<typeof test>('todoPage')
class TodoPage extends BasePage {
  @Given('TodoPage: step')
  step() {
    super.step();
  }
}

export
@Fixture<typeof test>('todoPage2')
class TodoPage2 extends BasePage {
  @Given('TodoPage2: step')
  step() {
    super.step();
  }
}

export
@Fixture<typeof test>('adminPage')
class AdminPage extends TodoPage {
  @Given('AdminPage: step')
  step() {
    super.step();
  }
}

// this classes are needed to check that algorithm
// correctly handles intermediate classes
export
@Fixture<typeof test>('intermediatePage')
class IntermediatePage extends TodoPage {}
class IntermediatePage2 extends IntermediatePage {}

export
@Fixture<typeof test>('adminPage2')
class AdminPage2 extends IntermediatePage2 /* actually TodoPage */ {
  @Given('AdminPage2: step')
  step() {
    super.step();
  }
}

export
@Fixture<typeof test>('adminPage3')
class AdminPage3 extends TodoPage2 {
  @Given('AdminPage3: step')
  step() {
    super.step();
  }
}
