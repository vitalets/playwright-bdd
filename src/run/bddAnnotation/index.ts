/**
 * Bdd data is a special annotation with test meta data, needed for Cucumber reporting.
 *
 * Previously we used attachment for that, but annotation is better:
 * it allows to update data synchronously, while attachment needs
 * to be asynchronously attached in teardown phase that may not run.
 * See: https://github.com/microsoft/playwright/issues/30175
 */
import { TestInfo } from '@playwright/test';
import { createTestStep } from '../../cucumber/createTestStep';
import { stringifyLocation } from '../../utils';
import { BddTestMeta } from '../../gen/bddMeta';
import { TestCase } from '@playwright/test/reporter';
import { PlaywrightLocation, PwAnnotation } from '../../playwright/types';
import { BddData } from './types';
import { updateAnnotation } from '../../playwright/utils';
import { StepDefinition } from '../../steps/registry';

const BDD_ANNOTATION_NAME = '__bddData';

export class BddAnnotation {
  private data: BddData;

  constructor(
    private testInfo: TestInfo,
    { pickleLocation }: BddTestMeta,
    uri: string,
  ) {
    this.data = { uri, pickleLocation, steps: [] };
    this.save({ create: true });
  }

  registerStep(
    stepDefinition: StepDefinition,
    stepText: string,
    pwStepLocation: PlaywrightLocation,
  ) {
    const step = createTestStep(stepDefinition, stepText);
    this.data.steps.push({
      pwStepLocation: stringifyLocation(pwStepLocation),
      stepMatchArgumentsLists: step.stepMatchArgumentsLists || [],
    });
    this.save();
  }

  private save({ create = false } = {}) {
    updateAnnotation(
      this.testInfo,
      {
        type: BDD_ANNOTATION_NAME,
        description: JSON.stringify(this.data),
      },
      { create },
    );
  }
}

export function getBddDataFromTest({ annotations }: TestCase) {
  const annotationIndex = annotations.findIndex(isBddAnnotation);
  const annotation = annotations[annotationIndex];
  const bddData = annotation?.description
    ? (JSON.parse(annotation.description) as BddData)
    : undefined;
  return { bddData, annotationIndex };
}

function isBddAnnotation(annotation: PwAnnotation) {
  return annotation.type === BDD_ANNOTATION_NAME;
}
