/**
 * BddWorld sub-property for internal usage.
 */
import { StepMatchArgumentsList } from '@cucumber/messages';
import { Fixtures, TestTypeCommon } from '../playwright/types';
import { BddWorld } from './bddWorld';
import { TestMeta } from '../gen/testMeta';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { createTestStep } from '../cucumber/createTestStep';
import { stringifyLocation } from '../utils';
import { PlaywrightLocation } from '../playwright/getLocationInFile';

// special attachment to provide data for cucumber reporters
// todo: move from this file
export type BddTestAttachment = {
  // feature file path relative to configDir
  uri: string;
  // location of pickle related to this test
  pickleLocation: string;
  // info about parsed arguments of each step to highlight in report
  steps: BddTestAttachmentStep[];
};

export type BddTestAttachmentStep = {
  // playwright step location in spec file
  pwStepLocation: string;
  // stepDefinition match result
  stepMatchArgumentsLists: readonly StepMatchArgumentsList[];
};

export class BddWorldInternal {
  currentStepFixtures: Fixtures<TestTypeCommon> = {};
  private steps: BddTestAttachmentStep[] = [];

  constructor(private world: BddWorld) {}

  registerStep(
    stepDefinition: StepDefinition,
    stepText: string,
    pwStepLocation: PlaywrightLocation,
  ) {
    const step = createTestStep(stepDefinition, stepText);
    this.steps.push({
      pwStepLocation: stringifyLocation(pwStepLocation),
      stepMatchArgumentsLists: step.stepMatchArgumentsLists || [],
    });
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
