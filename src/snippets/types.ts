import { KeywordType } from '../cucumber/keywordType';
import { PickleStep } from '@cucumber/messages';

export type MissingStep = {
  location: {
    uri: string;
    line: number;
    column?: number;
  };
  textWithKeyword: string;
  keywordType: KeywordType;
  pickleStep: PickleStep;
};
