import { BDDGEN_CMD, expect, startProcess } from '../../_helpers/index.mjs';

export const GENERATION_COMPLETED = 'Generation completed. Waiting for changes...';
export const GENERATION_FAILED = 'Generation failed. Waiting for changes...';

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
    return this.waitForOutput(GENERATION_COMPLETED);
  }

  get output() {
    return this.process.output;
  }

  getGenerationsCount() {
    return this.output.split(GENERATION_COMPLETED).length - 1;
  }

  waitForOutput(expected, offset = 0) {
    return this.process.waitForOutput(expected, offset);
  }

  stop() {
    return this.process.stop();
  }
}
