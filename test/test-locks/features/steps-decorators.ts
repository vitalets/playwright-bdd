import { Fixture, Given } from 'playwright-bdd/decorators';

@Fixture('resource')
export class Resource {
  @Given('decorator step with locks: lock4, lock1', {
    lock: ['lock4', 'lock1'],
  })
  @Given('decorator step with lock: lock8', { lock: 'lock8' })
  access() {}
}
