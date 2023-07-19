/**
 * Playwright-style snippet syntax.
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/custom_snippet_syntaxes.md
 */
import { GeneratedExpression } from '@cucumber/cucumber-expressions';
import {
  ISnippetSyntaxBuildOptions, // prettier-ignore
} from '@cucumber/cucumber/lib/formatter/step_definition_snippet_builder/snippet_syntax';

// todo: custom cucumber parameters
// See: https://github.com/cucumber/cucumber-expressions#custom-parameter-types

export default class {
  isTypescript = false;

  build({ generatedExpressions, functionName, stepParameterNames }: ISnippetSyntaxBuildOptions) {
    // Always take only first generatedExpression
    // Other expressions are for int/float combinations
    const generatedExpression = generatedExpressions[0];
    const expressionParameters = generatedExpression.parameterNames.map((name, i) => {
      const argName = `arg${i === 0 ? '' : i}`;
      const type = name.startsWith('string') ? 'string' : 'number';
      return this.isTypescript ? `${argName}: ${type}` : argName;
    });
    const stepParameters = stepParameterNames.map((argName) => {
      const type = argName === 'dataTable' ? 'DataTable' : 'string';
      return this.isTypescript ? `${argName}: ${type}` : argName;
    });
    const allParameterNames = ['{}', ...expressionParameters, ...stepParameters];
    const functionSignature = `${functionName}('${this.escapeSpecialCharacters(
      generatedExpression,
    )}', async (${allParameterNames.join(', ')}) => {`;

    return [
      functionSignature, // prettier-ignore
      `  // ...`,
      '});',
    ].join('\n');
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
