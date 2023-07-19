/**
 * Playwright-style snippet syntax for decorators.
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/custom_snippet_syntaxes.md
 */
import { GeneratedExpression } from '@cucumber/cucumber-expressions';
import {
  ISnippetSyntaxBuildOptions, // prettier-ignore
} from '@cucumber/cucumber/lib/formatter/step_definition_snippet_builder/snippet_syntax';

export default class {
  build({ generatedExpressions, functionName }: ISnippetSyntaxBuildOptions) {
    // Always take only first generatedExpression
    // Other expressions are for int/float combinations
    const generatedExpression = generatedExpressions[0];
    return `@${functionName}('${this.escapeSpecialCharacters(generatedExpression)}')`;
  }

  private escapeSpecialCharacters(generatedExpression: GeneratedExpression) {
    let source = generatedExpression.source;
    // double up any backslashes because we're in a javascript string
    source = source.replace(/\\/g, '\\\\');
    // escape any single quotes because that's our quote delimiter
    source = source.replace(/'/g, "\\'");
    return source;
  }
}
