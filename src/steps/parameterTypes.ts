/**
 * Custom parameter types registry.
 * Placeholder unit full refuse of cucumber.
 */
import { ParameterType } from '@cucumber/cucumber-expressions';
import { SourcedParameterTypeRegistry } from '../cucumber/SourcedParameterTypeRegistry';
import { getLocationByOffset } from '../playwright/getLocationInFile';
import { booleanDefault } from '../utils';

export const parameterTypeRegistry = new SourcedParameterTypeRegistry();

export interface IParameterTypeDefinition<T> {
  name: string;
  regexp: readonly RegExp[] | readonly string[] | RegExp | string;
  transformer: (...match: string[]) => T;
  useForSnippets?: boolean;
  preferForRegexpMatch?: boolean;
}

export function defineParameterType<T>(options: IParameterTypeDefinition<T>) {
  const parameterType = new ParameterType(
    options.name,
    options.regexp,
    null,
    options.transformer,
    booleanDefault(options.useForSnippets, true),
    booleanDefault(options.preferForRegexpMatch, false),
  );
  // todo: check offset
  const { file: uri, line } = getLocationByOffset(1);
  parameterTypeRegistry.defineSourcedParameterType(parameterType, {
    uri,
    line,
  });
}
