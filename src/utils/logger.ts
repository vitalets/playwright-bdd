/**
 * Simple logger
 */

export const logger = {
  log: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(...args);
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },
};
