/**
 * Bdd data is a special attachment with test meta data, needed for Cucumber reporting.
 */
import { StepMatchArgumentsList } from '@cucumber/messages';
import { BddWorld } from './bddWorld';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { createTestStep } from '../cucumber/createTestStep';
import { stringifyLocation } from '../utils';
import { TestMeta } from '../gen/testMeta';
import { TestResult } from '@playwright/test/reporter';
import { PlaywrightLocation, PwAttachment } from '../playwright/types';

const BDD_DATA_ATTACHMENT_NAME = '__bddData';

export type BddDataAttachment = {
  // feature file path relative to configDir
  uri: string;
  // location of pickle related to this test
  pickleLocation: string;
  // info about parsed arguments of each step to highlight in report
  steps: BddDataStep[];
};

export type BddDataStep = {
  // playwright step location in spec file
  pwStepLocation: string;
  // stepDefinition match result
  stepMatchArgumentsLists: readonly StepMatchArgumentsList[];
};

export class BddData {
  private steps: BddDataStep[] = [];

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

  async attach(testMeta: TestMeta, uri: string) {
    const attachment: BddDataAttachment = {
      uri,
      pickleLocation: testMeta.pickleLocation,
      steps: this.steps,
    };
    await this.world.testInfo.attach(BDD_DATA_ATTACHMENT_NAME, {
      contentType: 'application/json',
      body: JSON.stringify(attachment),
    });
  }
}

export function getBddDataFromTestResult(result: TestResult) {
  const attachment = result.attachments.find(isBddDataAttachment);
  const attachmentBody = attachment?.body?.toString();
  return attachmentBody ? (JSON.parse(attachmentBody) as BddDataAttachment) : undefined;
}

export function isBddDataAttachment(attachment: PwAttachment) {
  return attachment.name === BDD_DATA_ATTACHMENT_NAME;
}
