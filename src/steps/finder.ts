/**
 * Finding step definitions.
 */
import { PickleStepType } from '@cucumber/messages';
import { relativeToCwd } from '../utils/paths';
import { stepDefinitions } from './stepRegistry';
import { BDDConfig } from '../config/types';
import { matchDefinitions, StepMatchInput } from './stepDefinition';
import { MatchedStepDefinition } from './matchedStepDefinition';
import { matchWithStepIndex } from './stepIndex';
import { matchFromCache, updateCache } from './cache';

export class StepFinder {
  constructor(private config: BDDConfig) {}

  findDefinitions(step: StepMatchInput, tags?: string[]) {
    let definitions = this.match(step);

    if (this.config.matchKeywords) {
      definitions = this.filterByKeyword(definitions, step.keywordType);
    }

    if (tags?.length) {
      definitions = this.filterByTags(definitions, tags);
    }

    return definitions;
  }

  private match(step: StepMatchInput) {
    const cached = matchFromCache(step);
    if (cached) return cached;

    const matchedDefinitions = this.config.useStepIndex
      ? matchWithStepIndex(stepDefinitions, step)
      : matchDefinitions(stepDefinitions, step);

    updateCache(step, matchedDefinitions);

    return matchedDefinitions;
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
    const tags = definition.tagsExpression
      ? ` [tags: ${definition.tagsExpression.toString()}]`
      : '';
    return `  - ${definition.keyword} '${definition.patternString}' # ${file}:${definition.line}${tags}`;
  });

  return [
    `Multiple definitions matched scenario step.`,
    `Step: ${stepTextWithKeyword} # ${stepLocation}`,
    ...variants,
  ].join('\n');
}
