import { KeywordType } from '../cucumber/keywordType';
import { PickleStep } from '@cucumber/messages';

export type MissingStep = {
  location: {
    uri: string;
    line: number;
    column?: number;
  };
  keywordType: KeywordType;
  textWithKeyword: string;
  pickleStep: PickleStep;
};
