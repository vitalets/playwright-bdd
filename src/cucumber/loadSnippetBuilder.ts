/**
 * Loads snippet builder
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/builder.ts
 */

import { FormatterBuilder } from '@cucumber/cucumber';
import { ISupportCodeLibrary } from '@cucumber/cucumber/api';
import { SnippetInterface } from '@cucumber/cucumber/lib/formatter/step_definition_snippet_builder/snippet_syntax';

export async function loadSnippetBuilder(
  supportCodeLibrary: ISupportCodeLibrary,
  snippetInterface?: SnippetInterface,
  snippetSyntax?: string,
) {
  return FormatterBuilder.getStepDefinitionSnippetBuilder({
    cwd: process.cwd(),
    snippetInterface,
    snippetSyntax,
    supportCodeLibrary,
  });
}
