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
    const expectedArgs = this.getExpectedArgs(matchedDefinition, pickleStep);

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

  private getExpectedArgs(matchedDefinition: MatchedStepDefinition, pickleStep: PickleStep) {
    let expectedArgs = matchedDefinition.result.length;

    if (pickleStep.argument?.dataTable || pickleStep.argument?.docString) {
      expectedArgs += 1;
    }

    if (isPlaywrightStyle(matchedDefinition)) {
      // For Playwright-style steps the fixtures object is always passed first by the runtime,
      // but when the step has no captures and no doc string / data table,
      // the user may omit args entirely.
      return expectedArgs === 0
        ? { min: 0, max: 1 }
        : { min: expectedArgs + 1, max: expectedArgs + 1 };
    } else {
      return { min: expectedArgs, max: expectedArgs };
    }
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
