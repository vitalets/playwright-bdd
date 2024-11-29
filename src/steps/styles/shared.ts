import { TestTypeCommon } from '../../playwright/types';
import { AnyFunction, ProvidedStepOptions, StepPattern } from '../stepDefinition';

export type StepDefinitionArgs<StepFn extends AnyFunction> =
  | [pattern: StepPattern, fn: StepFn]
  | [pattern: StepPattern, providedOptions: ProvidedStepOptions, fn: StepFn];

export function parseStepDefinitionArgs<StepFn extends AnyFunction>(
  args: StepDefinitionArgs<StepFn>,
) {
  const [pattern, providedOptions, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
  return { pattern, providedOptions, fn };
}

export type StepConstructorOptions = {
  worldFixture?: string;
  customTest?: TestTypeCommon;
  defaultTags?: string;
};
