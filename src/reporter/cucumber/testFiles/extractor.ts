/**
 * Extracts data from generated file. Goes closely with gen/formatter.
 * Used in cucumber reporting to get meta info about tests.
 */
import fs from 'node:fs';
import * as pw from '@playwright/test/reporter';

export class TestFileExtractor {
  #featureUri = '';
  #lines: string[] = [];

  constructor(private filePath: string) {}

  private get lines() {
    if (this.#lines.length === 0) throw new Error(`File not loaded: ${this.filePath}`);
    return this.#lines;
  }

  get featureUri() {
    if (!this.#featureUri) this.#featureUri = this.getFeatureUri();
    return this.#featureUri;
  }

  async load() {
    const content = await fs.promises.readFile(this.filePath, 'utf8');
    this.#lines = content.split('\n');
  }

  /**
   * Pickle line number is rendered in test file as:
   * test('scenario 1', async ({ Given }) => { // 5
   */
  getPickleLineNumber(test: pw.TestCase) {
    const line = this.lines[test.location.line - 1];
    const pickleLineNumber = line.match(/\d+$/)?.[0];
    if (!pickleLineNumber) throw new Error(`Cannot extract pickle line from:\n${line}`);
    return Number(pickleLineNumber);
  }

  /**
   * Feature uri is rendered in test file as:
   * // Generated from: <feature uri>
   */
  private getFeatureUri() {
    const prefix = '// Generated from:';
    const line = this.lines.find((line) => line.startsWith(prefix));
    if (!line) throw new Error(`Cannot find feature uri in file: ${this.filePath}`);
    const featureUri = line.slice(prefix.length).trim();
    if (!featureUri) throw new Error(`Empty feature uri in file: ${this.filePath}`);
    return featureUri;
  }
}
