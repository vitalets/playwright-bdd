/**
 * Simple logger
 */

/* eslint-disable no-console */

type LoggerOptions = {
  verbose?: boolean;
};

export class Logger {
  constructor(private options: LoggerOptions = {}) {}

  log(...args: unknown[]) {
    if (this.options.verbose) console.log(...args);
  }

  warn(...args: unknown[]) {
    // using log() to output warnings to stdout, not stderr
    console.log(...args);
  }

  error(...args: unknown[]) {
    console.error(...args);
  }
}

// default logger
export const logger = new Logger();
