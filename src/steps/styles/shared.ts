import { TestTypeCommon } from '../../playwright/types';
import { AnyFunction, ProvidedStepOptions, StepPattern } from '../stepDefinition';

type StepPatternInput = StepPattern | readonly StepPattern[];

export type StepDefinitionArgs<StepFn extends AnyFunction> =
  | [pattern: StepPatternInput, fn: StepFn]
  | [pattern: StepPatternInput, providedOptions: ProvidedStepOptions, fn: StepFn];

export function parseStepDefinitionArgs<StepFn extends AnyFunction>(
  args: StepDefinitionArgs<StepFn>,
) {
  const [patternInput, providedOptions, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
  const patterns = Array.isArray(patternInput) ? patternInput : [patternInput];
  if (!patterns.length) throw new Error('Step patterns array must not be empty.');
  return { patterns: patterns as [StepPattern, ...StepPattern[]], providedOptions, fn };
}

export type StepConstructorOptions = {
  worldFixture?: string;
  customTest?: TestTypeCommon;
  defaultTags?: string;
};
