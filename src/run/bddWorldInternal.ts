/**
 * BddWorld sub-property for internal usage.
 */
import { TestStep } from '@cucumber/messages';
import { Fixtures, TestTypeCommon } from '../playwright/types';
import { BddWorld } from './bddWorld';
import { TestMeta } from '../gen/testMeta';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { createTestStep } from '../cucumber/createTestStep';

// special attachment to provide data for cucumber reporters
// todo: move from this file
export type BddTestAttachment = {
  // feature file path relative to configDir
  uri: string;
  // location of pickle related to this test
  pickleLocation: string;
  // info about parsed arguments of each step to highlight in report
  steps: TestStep[];
};

export class BddWorldInternal {
  currentStepFixtures: Fixtures<TestTypeCommon> = {};
  private steps: TestStep[] = [];

  constructor(private world: BddWorld) {}

  registerStep(stepDefinition: StepDefinition, stepText: string) {
    const step = createTestStep(stepDefinition, stepText);
    this.steps.push(step);
  }

  /**
   * Attach test meta for reporting.
   * todo: move to reporting?
   */
  async attachBddData(testMeta: TestMeta, uri: string) {
    const attachment: BddTestAttachment = {
      uri,
      pickleLocation: testMeta.pickleLocation,
      steps: this.steps,
    };
    await this.world.testInfo.attach('__bddData', {
      contentType: 'application/json',
      body: JSON.stringify(attachment),
    });
  }
}
