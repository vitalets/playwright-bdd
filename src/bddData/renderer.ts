/**
 * Renders BDD data in test file.
 */
import { indent } from '../gen/formatter';
import { SourceMapper } from '../gen/sourceMapper';
import { TestGen } from '../gen/test';
import { BddTestData } from './types';

export class BddDataRenderer {
  constructor(
    private tests: TestGen[],
    private sourceMapper: SourceMapper,
  ) {}

  renderFixture() {
    return [`$bddFileData: ({}, use) => use(bddFileData),`];
  }

  renderVariable() {
    const lines = this.tests.map((test) => {
      const data = this.getBddTestData(test);
      return `${JSON.stringify(data)},`;
    });
    return [
      'const bddFileData = [ // bdd-data-start', // prettier-ignore
      ...lines.map(indent),
      ']; // bdd-data-end',
    ];
  }

  private getBddTestData(test: TestGen): BddTestData {
    const steps = [...test.stepsData.values()].map(
      ({ pickleStep, gherkinStep, pomFixtureName, matchedDefinition }) => {
        return {
          pwStepLine: this.sourceMapper.getPwStepLine(pickleStep),
          gherkinStepLine: gherkinStep.location.line,
          keywordOrig: gherkinStep.keyword,
          keywordType: pickleStep.type,
          pomFixtureName,
          stepMatchArguments: matchedDefinition?.getStepMatchArguments(),
        };
      },
    );

    return {
      pwTestLine: this.sourceMapper.getPwTestLine(test.pickle),
      pickleLine: test.pickle.location.line,
      timeout: test.ownTimeout,
      slow: test.slow ? true : undefined,
      tags: test.tags,
      steps,
    };
  }
}