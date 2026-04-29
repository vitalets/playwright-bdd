/**
 * Validates step definition arity against runtime invocation shape and
 * accumulates all mismatches found while generating a feature test file.
 */
import { PickleStep, Step } from '@cucumber/messages';
import { MatchedStepDefinition } from '../../steps/matchedStepDefinition';
import { getStepTextWithKeyword } from '../../gherkin/helpers';
import { stringifyLocation } from '../../utils';
import { relativeToCwd } from '../../utils/paths';

export class ArityChecker {
  readonly errors: string[] = [];

  constructor(private featureUri: string) {}

  checkStepDefinitionArity(
    matchedDefinition: MatchedStepDefinition,
    pickleStep: PickleStep,
    gherkinStep: Step,
  ) {
    const expectedArgs = this.getExpectedArgs(matchedDefinition, pickleStep);
    const actualArgs = this.getActualArgs(matchedDefinition);

    // Cucumber-compatible strictness (without callback mode):
    // function arity must match invocation arguments exactly.
    if (actualArgs === expectedArgs) return;

    this.errors.push(
      this.formatError(
        matchedDefinition,
        {
          stepText: pickleStep.text,
          keyword: gherkinStep.keyword,
          location: gherkinStep.location,
        },
        { actualArgs, expectedArgs },
      ),
    );
  }

  private getExpectedArgs(matchedDefinition: MatchedStepDefinition, pickleStep: PickleStep) {
    return (
      this.getExpressionArgsCount(matchedDefinition) +
      this.getStepArgumentArgsCount(pickleStep) +
      this.getFixturesArgsCount(matchedDefinition)
    );
  }

  private getActualArgs(matchedDefinition: MatchedStepDefinition) {
    return matchedDefinition.definition.arity;
  }

  private getExpressionArgsCount(matchedDefinition: MatchedStepDefinition) {
    return matchedDefinition.result.length;
  }

  private getStepArgumentArgsCount(pickleStep: PickleStep) {
    return this.hasMultilineArgument(pickleStep) ? 1 : 0;
  }

  private getFixturesArgsCount(matchedDefinition: MatchedStepDefinition) {
    return matchedDefinition.definition.isCucumberStyle() ||
      matchedDefinition.definition.isDecorator()
      ? 0
      : 1;
  }

  private hasMultilineArgument(pickleStep: PickleStep) {
    return Boolean(pickleStep.argument?.dataTable || pickleStep.argument?.docString);
  }

  private formatError(
    matchedDefinition: MatchedStepDefinition,
    step: { stepText: string; keyword: Step['keyword']; location: Step['location'] },
    arity: { actualArgs: number; expectedArgs: number },
  ) {
    const stepTextWithKeyword = getStepTextWithKeyword(step.keyword, step.stepText);
    const stepLocation = `${this.featureUri}:${stringifyLocation(step.location)}`;
    const { definition } = matchedDefinition;
    const definitionLocation = `${relativeToCwd(definition.uri)}:${definition.line}`;

    return [
      `Step: ${stepTextWithKeyword} # ${stepLocation}`,
      `Definition: ${definition.keyword} '${definition.patternString}' # ${definitionLocation}`,
      `Function has ${arity.actualArgs} arguments, but expected ${arity.expectedArgs}.`,
    ].join('\n');
  }
}
