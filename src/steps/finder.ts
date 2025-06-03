/**
 * Finding step definitions.
 */
import { PickleStepType } from '@cucumber/messages';
import { relativeToCwd } from '../utils/paths';
import { stepDefinitions } from './stepRegistry';
import { BDDConfig } from '../config/types';
import { StepDefinition } from './stepDefinition';
import { MatchedStepDefinition } from './matchedStepDefinition';
import { toBoolean } from '../utils';

export class StepFinder {
  constructor(private config: BDDConfig) {}

  findDefinitions(keywordType: PickleStepType | undefined, stepText: string, tags?: string[]) {
    let definitions = this.matchByText(stepDefinitions, stepText);

    if (this.config.matchKeywords) {
      definitions = this.filterByKeyword(definitions, keywordType);
    }

    if (tags?.length) {
      definitions = this.filterByTags(definitions, tags);
    }

    return definitions;
  }

  private matchByText(definitions: StepDefinition[], stepText: string) {
    return definitions
      .map((definition) => definition.matchStepText(stepText)) // prettier-ignore
      .filter(toBoolean);
  }

  private filterByKeyword(
    matchedDefinitions: MatchedStepDefinition[],
    keywordType: PickleStepType | undefined,
  ) {
    return matchedDefinitions.filter(({ definition }) =>
      definition.matchesKeywordType(keywordType),
    );
  }

  private filterByTags(definitions: MatchedStepDefinition[], tags: string[]) {
    const definitionsWithoutTags = definitions.filter(({ definition }) => {
      const { tagsExpression } = definition;
      return !tagsExpression;
    });

    const matchedDefinitions = definitions.filter(({ definition }) => {
      const { tagsExpression } = definition;
      return tagsExpression && tagsExpression.evaluate(tags);
    });

    // If some definitions with tags matched, use them.
    // Otherwise return all definitions without tags.
    // See: https://github.com/vitalets/playwright-bdd/issues/300#issuecomment-2811845157
    return matchedDefinitions.length ? matchedDefinitions : definitionsWithoutTags;
  }
}

export function formatDuplicateStepsMessage(
  matchedDefinitions: MatchedStepDefinition[],
  stepTextWithKeyword: string,
  stepLocation: string,
) {
  const variants = matchedDefinitions.map(({ definition }) => {
    const file = definition.uri ? relativeToCwd(definition.uri) : '';
    return `  - ${definition.keyword} '${definition.patternString}' # ${file}:${definition.line}`;
  });

  return [
    `Multiple definitions matched scenario step.`,
    `Step: ${stepTextWithKeyword} # ${stepLocation}`,
    ...variants,
  ].join('\n');
}
