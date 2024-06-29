/**
 * SourcedParameterTypeRegistry: the same as ParameterTypeRegistry, but stores location of each arameter type.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/support_code_library_builder/sourced_parameter_type_registry.ts
 */

import { ParameterType, ParameterTypeRegistry } from '@cucumber/cucumber-expressions';

interface ILineAndUri {
  line: number;
  uri: string;
}

export class SourcedParameterTypeRegistry extends ParameterTypeRegistry {
  private parameterTypeToSource: WeakMap<ParameterType<unknown>, ILineAndUri> = new WeakMap();

  defineSourcedParameterType(parameterType: ParameterType<unknown>, source: ILineAndUri) {
    this.defineParameterType(parameterType);
    this.parameterTypeToSource.set(parameterType, source);
  }

  lookupSource(parameterType: ParameterType<unknown>) {
    return this.parameterTypeToSource.get(parameterType);
  }
}
