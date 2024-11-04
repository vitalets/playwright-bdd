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

import { StepMatchArgumentsList } from '@cucumber/messages';

export type BddDataStatic = {
  // line of pickle in feature file
  pickleLine: string;
  // info about steps
  steps: BddDataStaticStep[];
};

export type BddDataStaticStep = {
  // info about parsed arguments of each step to highlight in report
  stepMatchArgumentsLists: readonly StepMatchArgumentsList[];
};

export class BddDataStaticGen {
  private items: BddDataStatic[] = [];

  getLines() {
    return [
      '// bdd-data-start', // prettier-ignore
      '',
      ...this.items.map((item) => JSON.stringify(item)),
      '',
      '// bdd-data-end',
    ];
  }
}
