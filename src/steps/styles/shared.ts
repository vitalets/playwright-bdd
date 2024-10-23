import { ProvidedStepOptions, StepDefinitionOptions, StepPattern } from '../stepDefinition';

export type StepDefinitionArgs<StepFn extends StepDefinitionOptions['fn']> =
  | [pattern: StepPattern, fn: StepFn]
  | [pattern: StepPattern, providedOptions: ProvidedStepOptions, fn: StepFn];

export function parseStepDefinitionArgs<StepFn extends StepDefinitionOptions['fn']>(
  args: StepDefinitionArgs<StepFn>,
) {
  const [pattern, providedOptions, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
  return { pattern, providedOptions, fn };
}
