/**
 * Base reporter for Cucumber reporters.
 * Reference: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/index.ts
 */

import path from 'node:path';
import fs from 'node:fs';
import { Writable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { EventEmitter } from 'node:events';
import { MessagesBuilder } from './messagesBuilder';

export type InternalOptions = {
  cwd: string;
  messagesBuilder: MessagesBuilder;
};

export default class BaseReporter {
  public eventBroadcaster = new EventEmitter();
  protected outputStream: Writable = process.stdout;
  protected outputDir = '';

  constructor(protected internalOptions: InternalOptions) {}

  protected get eventDataCollector() {
    return this.internalOptions.messagesBuilder.eventDataCollector;
  }

  protected get messagesBuilder() {
    return this.internalOptions.messagesBuilder;
  }

  printsToStdio() {
    return isStdout(this.outputStream);
  }

  async init() {}

  async finished() {
    if (!isStdout(this.outputStream)) {
      this.outputStream.end();
      await finished(this.outputStream);
    }
  }

  protected setOutputStream(outputFile?: string) {
    if (!outputFile) return;
    const absolutePath = path.resolve(this.internalOptions.cwd, outputFile);
    this.outputDir = path.dirname(absolutePath);
    fs.mkdirSync(this.outputDir, { recursive: true });
    this.outputStream = fs.createWriteStream(absolutePath);
  }
}

function isStdout(stream: Writable) {
  return stream === process.stdout;
}
