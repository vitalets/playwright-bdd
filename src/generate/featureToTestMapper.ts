/**
 * Maps Gherkin nodes, pickles, and steps to their final locations in a generated Playwright test.
 *
 * Why temporary markers are needed:
 * The formatter renders nested arrays of strings, so the final generated line and column are not
 * known until Feature, Rule, Scenario Outline, tests, and steps have all been composed and indented.
 * While rendering, it appends metadata to the exact lines whose final locations we need:
 *
 *   test.describe('Feature', () => { // suite: 1,1
 *     test('Scenario', async ({ Given }) => { // test: 60a1...
 *       await Given('a step'); // step: 9c21...
 *     });
 *   });
 *
 * Marker meanings:
 * - `suite` maps a generated `test.describe` to a Feature, Rule, or Scenario Outline location.
 * - `test` maps a generated `test` call to a Cucumber pickle and provides `pwTestLine`.
 * - `step` maps a generated step call to one or more pickle steps and provides `pwStepLine`.
 *
 * After all code is composed, this class scans the lines, records their generated locations, and
 * removes the markers. Therefore, no marker comments are present in the test file saved to disk.
 * The collected locations are always used for technical BDD data and, when `sourceMaps` is enabled,
 * are also combined with Gherkin locations to generate the external Source Map v3 file.
 */
import { Location, Pickle, PickleStep } from '@cucumber/messages';
import {
  extractPickleIdFromLine,
  extractPickleStepIdsFromLine,
  extractSuiteLocationFromLine,
} from './formatter';

export type GeneratedLocation = {
  line: number;
  column: number;
};

export type SuiteLocationMapping = {
  generated: GeneratedLocation;
  original: Location;
};

export class FeatureToTestMapper {
  private pwTestLocations = new Map<string /* pickle id */, GeneratedLocation>();
  private pwStepLocations = new Map<string /* pickle step id */, GeneratedLocation>();
  private suiteLocations: SuiteLocationMapping[] = [];

  constructor(lines: string[]) {
    this.fillSuiteLocations(lines);
    this.fillPwTestLocations(lines);
    this.fillPwStepLocations(lines);
  }

  getPwTestLine(pickle: Pickle) {
    return this.getPwTestLocation(pickle).line;
  }

  getPwStepLine(pickleStep: PickleStep) {
    return this.getPwStepLocation(pickleStep).line;
  }

  getPwTestLocation(pickle: Pickle) {
    const location = this.pwTestLocations.get(pickle.id);
    if (!location) throw new Error(`Test location is not found: ${pickle.name}`);
    return location;
  }

  getPwStepLocation(pickleStep: PickleStep) {
    const location = this.pwStepLocations.get(pickleStep.id);
    if (!location) throw new Error(`Step location is not found: ${pickleStep.text}`);
    return location;
  }

  getSuiteLocations() {
    return this.suiteLocations;
  }

  private fillSuiteLocations(lines: string[]) {
    lines.forEach((line, index) => {
      const info = extractSuiteLocationFromLine(line);
      if (!info) return;
      this.suiteLocations.push({
        generated: this.createGeneratedLocation(line, index),
        original: info.location,
      });
      lines[index] = line.slice(0, info.index);
    });
  }

  private fillPwTestLocations(lines: string[]) {
    lines.forEach((line, index) => {
      const info = extractPickleIdFromLine(line);
      if (!info) return;
      this.pwTestLocations.set(info.pickleId, this.createGeneratedLocation(line, index));
      lines[index] = line.slice(0, info.index); // clear comment
    });
  }

  private fillPwStepLocations(lines: string[]) {
    lines.forEach((line, index) => {
      const info = extractPickleStepIdsFromLine(line);
      if (!info) return;
      info.pickleStepIds.forEach((pickleStepId) => {
        this.pwStepLocations.set(pickleStepId, this.createGeneratedLocation(line, index));
      });
      lines[index] = line.slice(0, info.index); // clear comment
    });
  }

  private createGeneratedLocation(line: string, index: number): GeneratedLocation {
    return {
      line: index + 1,
      column: Math.max(0, line.search(/\S/)),
    };
  }
}
