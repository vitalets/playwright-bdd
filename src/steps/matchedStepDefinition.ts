/**
 * Matched step definition.
 */

import { Argument } from '@cucumber/cucumber-expressions';
import type { Argument as BddExpressionArgument } from 'bdd-expressions' with {
  'resolution-mode': 'import',
};
import { Group, StepMatchArgument } from '@cucumber/messages';
import { StepDefinition } from './stepDefinition';
import { resolveBddExpressionParams } from './bddExpression/resolveParams';

export class MatchedStepDefinition {
  constructor(
    public definition: StepDefinition,
    public stepText: string,
    public result: readonly (Argument | BddExpressionArgument)[],
  ) {}

  async getMatchedParameters(
    world: unknown,
  ): Promise<unknown[] & { readonly params?: Record<string, unknown> }> {
    if (this.definition.usesBddExpression()) {
      return resolveBddExpressionParams(this.result, world);
    }
    return Promise.all(this.result.map((arg) => arg.getValue(world)));
  }

  /**
   * Returns step arguments in format suitable for reporter.
   * See: https://github.com/cucumber/cucumber-js/blob/main/src/assemble/assemble_test_cases.ts
   */
  getStepMatchArguments(): StepMatchArgument[] {
    return this.result.filter(isTextArgument).map((arg) => {
      return {
        group: mapArgumentGroup(arg.group),
        parameterTypeName: arg.parameterType.name,
      };
    });
  }
}

function isTextArgument(arg: Argument | BddExpressionArgument) {
  // DocString and DataTable parameters have no text captures; optional text parameters still do.
  return !('docString' in arg.parameterType || 'dataTable' in arg.parameterType);
}

function mapArgumentGroup(group: Argument['group'] | BddExpressionArgument['group']): Group {
  return {
    start: group.start,
    value: group.value,
    children: group.children?.map((child) => mapArgumentGroup(child)),
  };
}
