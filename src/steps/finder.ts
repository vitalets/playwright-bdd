/**
 * Finding step definitions.
 */
import { relativeToCwd } from '../utils/paths';
import { stepDefinitions } from './stepRegistry';
import { BDDConfig } from '../config/types';
import { KeywordType } from '../cucumber/keywordType';
import { StepDefinition } from './stepDefinition';

export class StepFinder {
  constructor(private config: BDDConfig) {}

  findDefinitions(keywordType: KeywordType, stepText: string) {
    const matchedStepsByText = this.filterByText(stepDefinitions, stepText);
    return this.config.matchKeywords
      ? this.filterByKeyword(matchedStepsByText, keywordType)
      : matchedStepsByText;
  }

  private filterByText(steps: StepDefinition[], stepText: string) {
    return steps.filter((step) => {
      // todo: store result to reuse later (MatchedStepDefinition)
      return Boolean(step.expression.match(stepText));
    });
  }

  private filterByKeyword(steps: StepDefinition[], keywordType: KeywordType) {
    return steps.filter((step) => {
      switch (step.keyword) {
        case 'Unknown':
          return true;
        case 'Given':
          return keywordType === 'precondition';
        case 'When':
          return keywordType === 'event';
        case 'Then':
          return keywordType === 'outcome';
      }
    });
  }

  // todo: filterByTags
}

export function formatDuplicateStepsMessage(
  matchedSteps: StepDefinition[],
  stepTextWithKeyword: string,
  stepLocation: string,
) {
  const stepLines = matchedSteps.map((step) => {
    const file = step.uri ? relativeToCwd(step.uri) : '';
    return `  - ${step.keyword} '${step.patternString}' # ${file}:${step.line}`;
  });

  return [
    `Multiple step definitions found!`,
    `Step: ${stepTextWithKeyword}`,
    `File: ${stepLocation}`,
    ...stepLines,
  ].join('\n');
}
