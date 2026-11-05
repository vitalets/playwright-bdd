/**
 * Validates step definition arity against runtime invocation shape and
 * accumulates all mismatches found while generating a feature test file.
 */
import { PickleStep, Step } from '@cucumber/messages';
import { MatchedStepDefinition } from '../../steps/matchedStepDefinition';
import { getStepTextWithKeyword } from '../../gherkin/helpers';
import { stringifyLocation } from '../../utils';
import { relativeToCwd } from '../../utils/paths';
import { BDDConfig } from '../../config/types';
import { StepDefinition } from '../../steps/stepDefinition';
import { stepDefinitions } from '../../steps/stepRegistry';

export class ArityChecker {
  readonly errors: string[] = [];

  constructor(
    private featureUri: string,
    private config: BDDConfig,
  ) {}

  checkStepDefinitionArity(
    matchedDefinition: MatchedStepDefinition,
    pickleStep: PickleStep,
    gherkinStep: Step,
  ) {
    if (!this.shouldCheckArity(matchedDefinition)) return;

    const stepFnArgs = matchedDefinition.definition.arity;
    const expectedArgs = this.getExpectedArgs(matchedDefinition);

    if (stepFnArgs >= expectedArgs.min && stepFnArgs <= expectedArgs.max) return;

    this.errors.push(
      this.formatError(
        matchedDefinition,
        {
          stepText: pickleStep.text,
          keyword: gherkinStep.keyword,
          location: gherkinStep.location,
        },
        stepFnArgs,
        expectedArgs,
      ),
    );
  }

  private getExpectedArgs(matchedDefinition: MatchedStepDefinition) {
    const { definition, result } = matchedDefinition;
    // A doc string / data table parameter is allowed even when absent in this step.
    const extraArgs = 1 + Number(isPlaywrightStyle(matchedDefinition));
    let max = result.length + extraArgs;
    if (definition.arity <= max) return { min: 0, max };

    for (const stepDefinition of getDefinitionsForMethod(definition)) {
      max = Math.max(max, stepDefinition.parameterCount + extraArgs);
      if (definition.arity <= max) break;
    }
    return { min: 0, max };
  }

  private shouldCheckArity(matchedDefinition: MatchedStepDefinition) {
    return matchedDefinition.definition.providedOptions?.arityCheck ?? this.config.arityCheck;
  }

  // eslint-disable-next-line max-params
  private formatError(
    matchedDefinition: MatchedStepDefinition,
    step: { stepText: string; keyword: Step['keyword']; location: Step['location'] },
    stepFnArgs: number,
    expectedArgs: { min: number; max: number },
  ) {
    const stepTextWithKeyword = getStepTextWithKeyword(step.keyword, step.stepText);
    const stepLocation = `${this.featureUri}:${stringifyLocation(step.location)}`;
    const { definition } = matchedDefinition;
    const definitionLocation = `${relativeToCwd(definition.uri)}:${definition.line}`;
    const expectedStr =
      expectedArgs.min === expectedArgs.max
        ? String(expectedArgs.min)
        : `${expectedArgs.min}-${expectedArgs.max}`;
    const actualArgsStr = stepFnArgs === 1 ? '1 argument' : `${stepFnArgs} arguments`;

    return [
      `Step: ${stepTextWithKeyword} # ${stepLocation}`,
      `Pattern: ${definition.patternString} # ${definitionLocation}`,
      `Function has ${actualArgsStr}, but expected ${expectedStr}.`,
    ].join('\n');
  }
}

function isPlaywrightStyle({ definition }: MatchedStepDefinition) {
  return !definition.isCucumberStyle() && !definition.isDecorator();
}

function getDefinitionsForMethod(stepDefinition: StepDefinition) {
  if (!stepDefinition.isDecorator()) return [];
  const { originalFn, pomNode } = stepDefinition;
  return stepDefinitions.filter(
    (definition) => definition.originalFn === originalFn && definition.pomNode === pomNode,
  );
}
