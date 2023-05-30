/**
 * Copied from Playwright wrapFunctionWithLocation
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/transform.ts#L229
 */
/// <reference path="./playwright.d.ts" />
import url from 'url';
import { sourceMapSupport } from '@playwright/test/lib/utilsBundle';

export function getLocationByStacktrace({ level }: { level: number }) {
  const oldPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (error, stackFrames) => {
    const frame: NodeJS.CallSite = sourceMapSupport.wrapCallSite(stackFrames[level]);
    const fileName = frame.getFileName();
    // Node error stacks for modules use file:// urls instead of paths.
    const file = fileName && fileName.startsWith('file://') ? url.fileURLToPath(fileName) : fileName;
    return {
      file,
      line: frame.getLineNumber(),
      column: frame.getColumnNumber(),
    };
  };
  const oldStackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = level + 1;
  const obj: { stack: Location } = {} as any;
  Error.captureStackTrace(obj);
  const location = obj.stack;
  Error.stackTraceLimit = oldStackTraceLimit;
  Error.prepareStackTrace = oldPrepareStackTrace;
  return location;
}
