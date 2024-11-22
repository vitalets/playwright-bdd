/**
 * Maps generated file lines to test and step locations.
 */
import { Pickle, PickleStep } from '@cucumber/messages';
import { extractPickleIdFromLine, extractPickleStepIdsFromLine } from './formatter';

export class SourceMapper {
  private pwTestLocations = new Map<string /* pickle id */, number /* line number */>();
  private pwStepLocations = new Map<string /* pickle step id */, number /* line number */>();

  constructor(lines: string[]) {
    this.fillPwTestLocations(lines);
    this.fillPwStepLocations(lines);
  }

  getPwTestLine(pickle: Pickle) {
    const line = this.pwTestLocations.get(pickle.id);
    if (!line) throw new Error(`Test location is not found: ${pickle.name}`);
    return line;
  }

  getPwStepLine(pickleStep: PickleStep) {
    const line = this.pwStepLocations.get(pickleStep.id);
    if (!line) throw new Error(`Step location is not found: ${pickleStep.text}`);
    return line;
  }

  private fillPwTestLocations(lines: string[]) {
    lines.forEach((line, index) => {
      const info = extractPickleIdFromLine(line);
      if (!info) return;
      this.pwTestLocations.set(info.pickleId, index + 1);
      lines[index] = line.slice(0, info.index); // clear comment
    });
  }

  private fillPwStepLocations(lines: string[]) {
    lines.forEach((line, index) => {
      const info = extractPickleStepIdsFromLine(line);
      if (!info) return;
      info.pickleStepIds.forEach((pickleStepId) => {
        this.pwStepLocations.set(pickleStepId, index + 1);
      });
      lines[index] = line.slice(0, info.index); // clear comment
    });
  }
}
