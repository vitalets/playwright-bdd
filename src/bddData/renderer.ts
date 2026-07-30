/**
 * Renders BDD data in test file.
 */
import { getStepTextWithKeyword } from '../gherkin/helpers';
import { indent } from '../generate/formatter';
import { FeatureToTestMapper } from '../generate/featureToTestMapper';
import { TestGen } from '../generate/test';
import { BddTestData } from './types';

export class BddDataRenderer {
  static varName = 'bddFileData';

  constructor(
    private tests: TestGen[],
    private featureToTestMapper: FeatureToTestMapper,
  ) {}

  renderFixture() {
    return [
      `$bddFileData: [({}, use) => use(${BddDataRenderer.varName}), { scope: "test", box: true }],`,
    ];
  }

  renderVariable() {
    const lines = this.tests.map((test) => {
      const data = this.getBddTestData(test);
      return `${JSON.stringify(data)},`;
    });
    return [
      `const ${BddDataRenderer.varName} = [ // bdd-data-start`, // prettier-ignore
      ...lines.map(indent),
      ']; // bdd-data-end',
    ];
  }

  private getBddTestData(test: TestGen): BddTestData {
    const steps = [...test.stepsData.values()].map(
      ({ pickleStep, gherkinStep, isBg, pomFixtureName, matchedDefinition }) => {
        return {
          pwStepLine: this.featureToTestMapper.getPwStepLine(pickleStep),
          gherkinStepLine: gherkinStep.location.line,
          keywordType: pickleStep.type,
          textWithKeyword: getStepTextWithKeyword(gherkinStep.keyword, pickleStep.text),
          isBg: isBg || undefined,
          pomFixtureName,
          stepMatchArguments: matchedDefinition?.getStepMatchArguments(),
        };
      },
    );

    return {
      pwTestLine: this.featureToTestMapper.getPwTestLine(test.pickle),
      pickleLine: test.pickle.location.line,
      skipped: test.skipped || undefined,
      timeout: test.ownTimeout,
      slow: test.slow || undefined,
      tags: test.tags,
      steps,
    };
  }
}
