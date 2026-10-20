import { stripVTControlCharacters } from 'node:util';
import { BDDGEN_CMD, expect, startProcess, waitFor } from '../../_helpers/index.mjs';

export const GENERATION_COMPLETED = 'generated';
export const GENERATION_FAILED = 'generation failed';

export class WatchProcess {
  constructor(testDir) {
    this.cwd = testDir.getAbsPath('.');
  }

  start({ args = [], env = {} } = {}) {
    this.process = startProcess(BDDGEN_CMD, {
      args: ['--watch', ...args],
      cwd: this.cwd,
      env,
    });
    return this;
  }

  async changeAndWait(change, expected = GENERATION_COMPLETED) {
    const outputOffset = this.output.length;
    change();
    await this.waitForOutput(expected, outputOffset);
    return this.output.slice(outputOffset);
  }

  async expectNoGeneration(change) {
    const outputOffset = this.output.length;
    change();
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(this.output.slice(outputOffset)).not.toContain(GENERATION_COMPLETED);
  }

  ready() {
    return this.waitForOutput('Ready');
  }

  get output() {
    return stripVTControlCharacters(this.process.output);
  }

  getGenerationsCount() {
    return (
      (this.output.includes('Ready') ? 1 : 0) + this.output.split(GENERATION_COMPLETED).length - 1
    );
  }

  async waitForOutput(expected, offset = 0) {
    // Offsets and matches must use the same stripped text as assertions.
    try {
      await waitFor(() => {
        if (this.output.slice(offset).includes(expected)) return true;
        if (this.process.exitCode !== null) throw new Error('Process exited.');
        return false;
      });
    } catch (error) {
      throw new Error(
        `${error.message}\nWaiting for: ${expected}\nProcess output:\n${this.output}`,
        { cause: error },
      );
    }
  }

  stop() {
    return this.process.stop();
  }
}
