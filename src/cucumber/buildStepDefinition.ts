/**
 * Extracted from cucumber SupportCodeLibraryBuilder.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/support_code_library_builder/index.ts
 */
import { IdGenerator } from '@cucumber/messages';
import {
  CucumberExpression,
  RegularExpression,
  ParameterTypeRegistry,
} from '@cucumber/cucumber-expressions';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface IStepDefinitionConfig {
  code: any;
  line: number;
  options: any;
  keyword: GherkinStepKeyword;
  pattern: string | RegExp;
  uri: string;
}

const newId = IdGenerator.uuid();

export function buildStepDefinition(
  { keyword, pattern, code, line, options, uri }: IStepDefinitionConfig,
  parameterTypeRegistry: ParameterTypeRegistry,
) {
  // todo: handle error.undefinedParameterTypeName as it's done in cucumber?
  const expression =
    typeof pattern === 'string'
      ? new CucumberExpression(pattern, parameterTypeRegistry)
      : new RegularExpression(pattern, parameterTypeRegistry);

  // skip wrapping code as it is not needed for decorator steps
  // const wrappedCode = this.wrapCode({
  //   code,
  //   wrapperOptions: options.wrapperOptions,
  // })

  return new StepDefinition({
    code,
    expression,
    id: newId(),
    line,
    options,
    keyword,
    pattern,
    unwrappedCode: code,
    uri,
  });
}
