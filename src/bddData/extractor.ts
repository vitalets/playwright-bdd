/**
 * Extracts BDD data from test file.
 */

import { throwIf } from '../utils';
import { BddTestData } from './types';

export class BddDataExtractor {
  private lines: string[];

  constructor(
    private filePath: string,
    content: string,
  ) {
    this.lines = content.split('\n');
  }

  extract() {
    const startIndex = this.findStartIndex();
    const endIndex = this.findEndIndex();
    const bddDataLines = this.lines.slice(startIndex + 1, endIndex);
    return bddDataLines.map((line) => this.extractBddTestData(line));
  }

  /**
   * Extract feature uri from the generated test file.
   * // Generated from: <feature uri>
   *
   * todo: maybe move to another module.
   */
  extractFeatureUri() {
    const prefix = '// Generated from:';
    const line = this.lines[0];
    if (!line?.startsWith(prefix))
      throw new Error(`Cannot find feature uri in file: ${this.filePath}`);
    const featureUri = line.slice(prefix.length).trim();
    if (!featureUri) throw new Error(`Empty feature uri in file: ${this.filePath}`);
    return featureUri;
  }

  private findStartIndex() {
    const index = this.lines.findIndex((line) => line.endsWith('// bdd-data-start'));
    throwIf(index === -1, `Cannot find 'bdd-data-start' in: ${this.filePath}`);
    return index;
  }

  private findEndIndex() {
    const index = this.lines.findIndex((line) => line.endsWith('// bdd-data-end'));
    throwIf(index === -1, `Cannot find 'bdd-data-end' in: ${this.filePath}`);
    return index;
  }

  private extractBddTestData(line: string) {
    line = line.trim().replace(/,$/, '');
    return JSON.parse(line) as BddTestData;
  }
}
