/**
 * Class to manage bdd annotation - special annotation attached to each test
 * and used for Cucumber reporting.
 *
 * Previously we used attachment for that, but annotation is better:
 * - can be attached statically during test generation
 * - allows to update data synchronously, while attachment needs
 * to be asynchronously attached in teardown phase that may not run.
 * See: https://github.com/microsoft/playwright/issues/30175
 */
import { TestInfo } from '@playwright/test';
import { createTestStep } from '../cucumber/createTestStep';
import { stringifyLocation } from '../utils';
import { BddTestMeta } from '../gen/bddMetaBuilder';
import { TestCase } from '@playwright/test/reporter';
import { PlaywrightLocation, PwAnnotation } from '../playwright/types';
import { BddAnnotationData } from './types';
import { updateAnnotation } from '../playwright/utils';
import { StepDefinition } from '../steps/stepDefinition';

const BDD_ANNOTATION_NAME = '__bddData';

export class BddAnnotation {
  private data: BddAnnotationData;

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

/**
 * Extract bdd data from test annotations.
 */
export function extractBddData({ annotations }: TestCase) {
  const annotationIndex = annotations.findIndex(isBddAnnotation);
  const annotation = annotations[annotationIndex];
  const bddData = annotation?.description
    ? (JSON.parse(annotation.description) as BddAnnotationData)
    : undefined;
  return bddData;
}

function isBddAnnotation(annotation: PwAnnotation) {
  return annotation.type === BDD_ANNOTATION_NAME;
}
