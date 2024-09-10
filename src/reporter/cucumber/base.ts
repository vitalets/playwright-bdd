/**
 * Base reporter for Cucumber reporters.
 * Reference: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/index.ts
 */

import path from 'node:path';
import fs from 'node:fs';
import { Writable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { EventEmitter } from 'node:events';
import * as messages from '@cucumber/messages';
import EventDataCollector from '../../cucumber/formatter/EventDataCollector.js';

export type InternalOptions = {
  cwd: string;
  eventBroadcaster: EventEmitter;
  eventDataCollector: EventDataCollector;
};

export type SkipAttachments = boolean | ('image/png' | 'video/webm' | 'application/zip' | string)[];

export default class BaseReporter {
  protected outputStream: Writable = process.stdout;

  constructor(protected internalOptions: InternalOptions) {}

  get eventBroadcaster() {
    return this.internalOptions.eventBroadcaster;
  }

  get eventDataCollector() {
    return this.internalOptions.eventDataCollector;
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
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    this.outputStream = fs.createWriteStream(absolutePath);
  }
}

function isStdout(stream: Writable) {
  return stream === process.stdout;
}

export function isAttachmentAllowed(
  envelope: messages.Envelope,
  skipAttachments?: SkipAttachments,
) {
  if (!('attachment' in envelope)) return true;
  return Array.isArray(skipAttachments)
    ? !skipAttachments.includes(envelope.attachment?.mediaType || '')
    : skipAttachments !== true;
}
