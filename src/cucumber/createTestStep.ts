/**
 * Creates partial TestStep for usage in reporter.
 * It is partial, b/c final pickleStepId will be known later.
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/assemble_test_cases.ts#L93
 */

import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { Group, TestStep } from '@cucumber/messages';

type PartialTestStep = Pick<TestStep, 'stepDefinitionIds' | 'stepMatchArgumentsLists'>;

export function createTestStepPartial(
  stepDefinition: StepDefinition,
  stepText: string,
): PartialTestStep {
  const result = stepDefinition.expression.match(stepText);
  if (!result) {
    // this should not happen as stepDefinition is already matched
    throw Error(`Step definition didn't match step "${stepText}"`);
  }

  const stepMatchArguments = result.map((arg) => {
    return {
      group: mapArgumentGroup(arg.group),
      parameterTypeName: arg.parameterType.name,
    };
  });

  return {
    stepDefinitionIds: [stepDefinition.id],
    stepMatchArgumentsLists: [{ stepMatchArguments }],
  };
}

function mapArgumentGroup(group: Group): Group {
  return {
    start: group.start,
    value: group.value,
    children: group.children?.map((child) => mapArgumentGroup(child)),
  };
}
