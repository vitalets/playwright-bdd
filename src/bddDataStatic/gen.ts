/**
 * Class to generate bdd data to be used in reporter via reading spec file
 * and extracting comments.
 * Example:
 *
 * // bdd-data-start
 *
 * {"pickleLine": 1, "steps": [ ... ]}
 * {"pickleLine": 5, "steps": [ ... ]}
 *
 * // bdd-data-end
 */

import { StepMatchArgument } from '@cucumber/messages';
import { PickleWithLocation } from '../features/types';
import { AutofillMap } from '../utils/AutofillMap';
import { MatchedStepDefinition } from '../steps/matchedStepDefinition';

export type BddDataStatic = {
  // line of pickle in feature file - unique identifier of test
  pickleLine: number;
  // info about parsed arguments of each step to use in report
  steps: BddDataStaticStep[];
};

export type BddDataStaticStep = {
  stepMatchArguments?: StepMatchArgument[];
};

export class BddDataStaticGen {
  private tests = new AutofillMap<number, BddDataStatic>();

  // todo
  // registerTest(pickle: PickleWithLocation) {
  //   const pickleLine = pickle.location.line;
  //   this.tests.set(pickleLine, {
  //     pickleLine,
  //     steps: pickle.steps.map((pickleStep) => {
  //       pickleStep.
  //       return {};
  //     }),
  //   });
  // }

  registerStep(pickle: PickleWithLocation, matchedDefinition: MatchedStepDefinition) {
    const pickleLine = pickle.location.line;
    const stepMatchArguments = matchedDefinition.getStepMatchArguments();
    // the problem here is that we register only scenario steps, but not background steps
    this.tests.get(pickleLine)!.steps.push({ stepMatchArguments });
  }

  getLines() {
    return [
      '// bdd-data-start', // prettier-ignore
      '',
      ...[...this.tests.values()].map((item) => JSON.stringify(item)),
      '',
      '// bdd-data-end',
    ];
  }
}
