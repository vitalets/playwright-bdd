/**
 * Copied from Playwright wrapFunctionWithLocation
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/transform.ts#L229
 */
import url from 'url';
import path from 'path';

export function getLocationByStacktrace({ level }: { level: number }) {
  const sourceMapSupport = requireSourceMapSupport();
  const oldPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (error, stackFrames) => {
    const frame: NodeJS.CallSite = sourceMapSupport.wrapCallSite(stackFrames[level]);
    const fileName = frame.getFileName();
    // Node error stacks for modules use file:// urls instead of paths.
    const file =
      fileName && fileName.startsWith('file://') ? url.fileURLToPath(fileName) : fileName;
    return {
      file,
      line: frame.getLineNumber(),
      column: frame.getColumnNumber(),
    };
  };
  const oldStackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = level + 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: { stack: Location } = {} as any;
  Error.captureStackTrace(obj);
  const location = obj.stack;
  Error.stackTraceLimit = oldStackTraceLimit;
  Error.prepareStackTrace = oldPrepareStackTrace;
  return location;
}

function requireSourceMapSupport() {
  const playwrightRoot = path.dirname(require.resolve('@playwright/test'));
  const utilsBundlePath = path.join(playwrightRoot, 'lib', 'utilsBundle.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { sourceMapSupport } = require(utilsBundlePath);
  return sourceMapSupport;
}
