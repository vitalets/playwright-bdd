/**
 * Loads snippet builder
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/builder.ts
 */

import { FormatterBuilder } from '@cucumber/cucumber';
import { SnippetInterface } from '@cucumber/cucumber/lib/formatter/step_definition_snippet_builder/snippet_syntax';
import { ISupportCodeLibrary } from './types';

export async function loadSnippetBuilder(
  supportCodeLibrary: ISupportCodeLibrary,
  snippetInterface?: SnippetInterface,
  snippetSyntax?: string,
) {
  return FormatterBuilder.getStepDefinitionSnippetBuilder({
    cwd: process.cwd(),
    snippetInterface,
    snippetSyntax,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore it's safe to use our ISupportCodeLibrary because only .parameterTypeRegistry is used
    supportCodeLibrary,
  });
}
