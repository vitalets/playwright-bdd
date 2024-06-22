/**
 * Custom parameter types registry.
 * Placeholder unit full refuse of cucumber.
 */
import { ParameterType, RegExps } from '@cucumber/cucumber-expressions';
import { SourcedParameterTypeRegistry } from '../cucumber/SourcedParameterTypeRegistry';
import { getLocationByOffset } from '../playwright/getLocationInFile';
import { defaultBoolean } from '../utils';

export const parameterTypeRegistry = new SourcedParameterTypeRegistry();

export interface IParameterTypeDefinition<T> {
  name: string;
  regexp: RegExps;
  transformer?: (...match: string[]) => T;
  useForSnippets?: boolean;
  preferForRegexpMatch?: boolean;
}

export function defineParameterType<T>(options: IParameterTypeDefinition<T>) {
  const parameterType = new ParameterType(
    options.name,
    options.regexp,
    null,
    options.transformer,
    defaultBoolean(options.useForSnippets, true),
    defaultBoolean(options.preferForRegexpMatch, false),
  );
  const { file: uri, line } = getLocationByOffset(1);
  parameterTypeRegistry.defineSourcedParameterType(parameterType, {
    uri,
    line,
  });
}
