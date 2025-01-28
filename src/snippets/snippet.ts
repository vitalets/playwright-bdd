import { CucumberExpressionGenerator, GeneratedExpression } from '@cucumber/cucumber-expressions';
import { parameterTypeRegistry } from '../steps/parameterTypes';
import { PickleStepType } from '@cucumber/messages';
import { StepData } from '../generate/test';

export type SnippetOptions = {
  isTypeScript: boolean;
  isPlaywrightStyle: boolean;
  isDecorator: boolean;
};

export class Snippet {
  private generatedExpression: GeneratedExpression;
  public code: string;

  constructor(
    private missingStep: StepData,
    private options: SnippetOptions,
  ) {
    this.generatedExpression = this.generateExpression();
    this.code = this.options.isDecorator ? this.buildDecoratorCode() : this.buildCode();
  }

  private get pickleStep() {
    return this.missingStep.pickleStep;
  }

  private buildCode() {
    const stepType = this.getStepType();
    const pattern = this.getPattern();
    const stepFn = this.getStepFunction();
    return [
      `${stepType}(${pattern}, ${stepFn}`, // prettier-ignore
      `  // {step}`,
      `  // {location}`,
      '});',
    ].join('\n');
  }

  private buildDecoratorCode() {
    const stepType = this.getStepType();
    const pattern = this.getPattern();
    return `@${stepType}(${pattern}); // {location}`;
  }

  private getStepType() {
    switch (this.pickleStep.type) {
      case PickleStepType.ACTION:
        return 'When';
      case PickleStepType.OUTCOME:
        return 'Then';
      case PickleStepType.CONTEXT:
      case PickleStepType.UNKNOWN:
      default:
        return 'Given';
    }
  }

  private getPattern() {
    return `'${escapeSpecialCharacters(this.generatedExpression.source)}'`;
  }

  private getStepFunction() {
    const args = this.getStepFunctionArguments().join(', ');
    return this.options.isPlaywrightStyle
      ? `async (${args}) => {` // prettier-ignore
      : `async function (${args}) {`;
  }

  private getStepFunctionArguments() {
    return [
      this.options.isPlaywrightStyle ? '{}' : '',
      ...this.getPatternArguments(),
      this.getLastArgument(),
    ].filter(Boolean);
  }

  private getPatternArguments() {
    return this.generatedExpression.parameterNames.map((name, i) => {
      const argName = `arg${i === 0 ? '' : i}`;
      const type = name.startsWith('string') ? 'string' : 'number';
      return this.options.isTypeScript ? `${argName}: ${type}` : argName;
    });
  }

  private getLastArgument() {
    const { argument } = this.pickleStep;
    if (!argument) return;

    const [argName, type] = argument.dataTable
      ? ['dataTable', 'DataTable']
      : ['docString', 'string'];

    return this.options.isTypeScript ? `${argName}: ${type}` : argName;
  }

  private generateExpression() {
    const cucumberExpressionGenerator = new CucumberExpressionGenerator(
      () => parameterTypeRegistry.parameterTypes,
    );

    const generatedExpressions = cucumberExpressionGenerator.generateExpressions(
      this.pickleStep.text,
    );

    // Always take only first generatedExpression
    // Other expressions are for int/float combinations
    const firstExpression = generatedExpressions[0];
    if (!firstExpression) {
      throw new Error(`Could not generate expression for step: ${this.pickleStep.text}`);
    }

    return firstExpression;
  }
}

function escapeSpecialCharacters(source: string) {
  return (
    source
      // double up any backslashes because we're in a javascript string
      .replace(/\\/g, '\\\\')
      // escape any single quotes because that's our quote delimiter
      .replace(/'/g, "\\'")
  );
}
