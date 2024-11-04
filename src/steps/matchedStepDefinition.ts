/**
 * Matched step definition.
 */

import { Argument } from '@cucumber/cucumber-expressions';
import { Group, StepMatchArgument } from '@cucumber/messages';
import { StepDefinition } from './stepDefinition';

export class MatchedStepDefinition {
  constructor(
    public definition: StepDefinition,
    public stepText: string,
    public result: readonly Argument[],
  ) {}

  async getMatchedParameters(world: unknown) {
    return Promise.all(this.result.map((arg) => arg.getValue(world)));
  }

  /**
   * Returns step arguments in format suitable for reporter.
   * See: https://github.com/cucumber/cucumber-js/blob/main/src/assemble/assemble_test_cases.ts
   */
  getStepMatchArguments(): StepMatchArgument[] {
    return this.result.map((arg) => {
      return {
        group: mapArgumentGroup(arg.group),
        parameterTypeName: arg.parameterType.name,
      };
    });
  }
}

function mapArgumentGroup(group: Group): Group {
  return {
    start: group.start,
    value: group.value,
    children: group.children?.map((child) => mapArgumentGroup(child)),
  };
}
