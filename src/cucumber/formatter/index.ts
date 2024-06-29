import { Writable } from 'node:stream';
import { EventEmitter } from 'node:events';
import EventDataCollector from './EventDataCollector';
import { IColorFns } from './getColorFns';

interface FormatRerunOptions {
  separator?: string;
}

interface FormatOptions {
  colorsEnabled?: boolean;
  rerun?: FormatRerunOptions;
  snippetInterface?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  snippetSyntax?: string;
  printAttachments?: boolean;
  [customKey: string]: unknown;
}

type IFormatterLogFn = (buffer: string | Uint8Array) => void;
type IFormatterCleanupFn = () => Promise<unknown>;

export interface IFormatterOptions {
  colorFns: IColorFns;
  cwd: string;
  eventBroadcaster: EventEmitter;
  eventDataCollector: EventDataCollector;
  log: IFormatterLogFn;
  parsedArgvOptions: FormatOptions;
  snippetBuilder: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  stream: Writable;
  cleanup: IFormatterCleanupFn;
  supportCodeLibrary: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// simplified Formatter class
export default class Formatter {
  static readonly documentation: string;
  constructor(private options: IFormatterOptions) {}
  async finished(): Promise<void> {}
}
