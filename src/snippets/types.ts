import { PickleStep } from '@cucumber/messages';

export type MissingStep = {
  location: {
    uri: string;
    line: number;
    column?: number;
  };
  textWithKeyword: string;
  pickleStep: PickleStep;
};
