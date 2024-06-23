/**
 * Own step definitions registry.
 */

import { buildStepDefinition } from '../cucumber/buildStepDefinition';
import { StepDefinition } from '../cucumber/types';
import { parameterTypeRegistry } from './parameterTypes';
import { CucumberStepFunction, StepConfig } from './stepConfig';

export const stepDefinitions: StepDefinition[] = [];

export function registerStepDefinitionOwn(stepConfig: StepConfig, code: CucumberStepFunction) {
  const { keyword, pattern } = stepConfig;
  const { file: uri, line } = stepConfig.location;
  const stepDefinition = buildStepDefinition(
    {
      keyword,
      pattern,
      code,
      uri,
      line,
      options: {},
    },
    parameterTypeRegistry,
  );
  stepDefinitions.push(stepDefinition);
}
