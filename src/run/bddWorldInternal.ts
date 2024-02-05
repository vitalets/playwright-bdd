/**
 * Sub-class of BddWorld for internal usage, to keep main fields clear.
 */
import { Fixtures, TestTypeCommon } from '../playwright/types';
import { BddData } from './attachments/BddData';
import { CucumberAttachments } from './attachments/CucumberAttachments';
import { BddWorld } from './bddWorld';

export class BddWorldInternal {
  currentStepFixtures: Fixtures<TestTypeCommon> = {};
  bddData: BddData;

  constructor(
    world: BddWorld,
    public cucumberAttachments: CucumberAttachments,
  ) {
    this.bddData = new BddData(world);
  }
}
