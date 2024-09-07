/**
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/helpers/keyword_type.ts
 */
import { Dialect, dialects } from '@cucumber/gherkin';
import { doesHaveValue } from './valueChecker';

export enum KeywordType {
  Precondition = 'precondition',
  Event = 'event',
  Outcome = 'outcome',
}

interface IGetStepKeywordTypeOptions {
  keyword: string;
  language: string;
  previousKeywordType?: KeywordType;
}

// eslint-disable-next-line visual/complexity
export function getStepKeywordType({
  keyword,
  language,
  previousKeywordType,
}: IGetStepKeywordTypeOptions): KeywordType {
  const dialect: Dialect = dialects[language];
  const stepKeywords = ['given', 'when', 'then', 'and', 'but'] as const;
  const type = stepKeywords.find((key) => dialect[key].includes(keyword));
  switch (type) {
    case 'when':
      return KeywordType.Event;
    case 'then':
      return KeywordType.Outcome;
    case 'and':
    case 'but':
      if (doesHaveValue(previousKeywordType)) {
        return previousKeywordType;
      }
    // fallthrough
    default:
      return KeywordType.Precondition;
  }
}
