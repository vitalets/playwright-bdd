/**
 * Sub-class of BddWorld for internal usage, to keep main fields clear.
 */
import { Fixtures, TestTypeCommon } from '../playwright/types';
import { BddData } from './bddDataAttachment';
import { BddWorld } from './bddWorld';

export class BddWorldInternal {
  currentStepFixtures: Fixtures<TestTypeCommon> = {};
  bddData: BddData;

  constructor(world: BddWorld) {
    this.bddData = new BddData(world);
  }
}
