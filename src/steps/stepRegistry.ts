/**
 * Step definitions registry - global array to store all step definitions.
 */

import { StepDefinition, StepDefinitionOptions } from './stepDefinition';

export const stepDefinitions: StepDefinition[] = [];

export function registerStepDefinition(options: StepDefinitionOptions) {
  const stepDefinition = new StepDefinition(options);
  stepDefinitions.push(stepDefinition);
}
