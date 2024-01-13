/**
 * BddWorld sub-property for internal usage.
 */
import { Fixtures, TestTypeCommon } from '../playwright/types';
import { BddWorld } from './bddWorld';
import { TestMeta } from '../gen/testMeta';

export class BddWorldInternal {
  currentStepFixtures: Fixtures<TestTypeCommon> = {};

  constructor(private world: BddWorld) {}

  /**
   * Attach test meta for reporting.
   */
  async attachBddData({ pickleLocation }: TestMeta) {
    await this.world.testInfo.attach('__bddData', {
      body: JSON.stringify({ pickleLocation }),
    });
  }
}
