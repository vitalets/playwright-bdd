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

  findDefinitions(keywordType: KeywordType, stepText: string, tags?: string[]) {
    let matchedSteps = this.filterByText(stepDefinitions, stepText);

    if (this.config.matchKeywords) {
      matchedSteps = this.filterByKeyword(matchedSteps, keywordType);
    }

    if (tags) {
      matchedSteps = this.filterByTags(matchedSteps, tags);
    }

    return matchedSteps;
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

  private filterByTags(steps: StepDefinition[], tags: string[]) {
    return steps.filter((step) => step.matchesTags(tags));
  }
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
    `Multiple definitions (${matchedSteps.length}) matched scenario step!`,
    `Step: ${stepTextWithKeyword} # ${stepLocation}`,
    ...stepLines,
  ].join('\n');
}
