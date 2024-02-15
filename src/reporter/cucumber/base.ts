/**
 * Base reporter for Cucumber reporters.
 * Reference: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/index.ts
 */

import path from 'node:path';
import fs from 'node:fs';
import { Writable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { EventEmitter } from 'node:events';
import EventDataCollector from '../../cucumber/formatter/EventDataCollector';

export type BaseReporterOptions = {
  cwd: string;
  eventBroadcaster: EventEmitter;
  eventDataCollector: EventDataCollector;
};

export default class BaseReporter {
  protected outputStream: Writable = process.stdout;

  constructor(protected baseOptions: BaseReporterOptions) {}

  get eventBroadcaster() {
    return this.baseOptions.eventBroadcaster;
  }

  get eventDataCollector() {
    return this.baseOptions.eventDataCollector;
  }

  printsToStdio() {
    return this.outputStream === process.stdout;
  }

  async finished() {
    if (!this.printsToStdio()) {
      this.outputStream.end();
      await finished(this.outputStream);
    }
  }

  protected setOutputStream(outputFile?: string) {
    if (!outputFile) return;
    const absolutePath = path.resolve(this.baseOptions.cwd, outputFile);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    this.outputStream = fs.createWriteStream(absolutePath);
  }
}
