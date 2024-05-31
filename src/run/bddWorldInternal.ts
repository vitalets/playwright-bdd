/**
 * Sub-class of BddWorld for internal usage, to keep main fields clear.
 */
import { Fixtures, TestTypeCommon } from '../playwright/types';
import { BddDataManager } from './bddData';

export class BddWorldInternal {
  currentStepFixtures: Fixtures<TestTypeCommon> = {};
  newCucumberStyleWorld: unknown = null;
  bddDataManager?: BddDataManager;
}
