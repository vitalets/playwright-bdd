/**
 * Step definitions registry - global array to store all step definitions.
 */

import { StepDefinition, StepDefinitionOptions } from './stepDefinition';
import { validateStepRegExp } from './regexp';

export const stepDefinitions: StepDefinition[] = [];

export function registerStepDefinition(options: StepDefinitionOptions) {
  if (typeof options.pattern !== 'string') {
    validateStepRegExp(options.pattern, options.location);
  }
  const stepDefinition = new StepDefinition(options);
  stepDefinitions.push(stepDefinition);
}
