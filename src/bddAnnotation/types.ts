import { StepMatchArgumentsList } from '@cucumber/messages';

export type BddAnnotationData = {
  // feature file path relative to configDir
  uri: string;
  // location of pickle related to this test
  pickleLocation: string;
  // info about parsed arguments of each step to highlight in report
  steps: BddAnnotationDataStep[];
};

export type BddAnnotationDataStep = {
  // playwright step location in spec file
  pwStepLocation: string;
  // stepDefinition match result
  stepMatchArgumentsLists: readonly StepMatchArgumentsList[];
};
