import url from 'url';
import { requirePlaywrightModule } from './utils';

// cucumber has also Location type, but it does not contain file and column is optional.
export interface PlaywrightLocation {
  file: string;
  line: number;
  column: number;
}

/**
 * Finds first frame in the callstack that matches provided file.
 * Constructs location object from that frame.
 *
 * Example:
 * Calling getLocationInFile('file-3.js');
 * Call stack:
 * - at <anonymous> (file-1.js:1:2)
 * - at myFunction2 (file-2.js:3:4)
 * - at myFunction3 (file-3.js:5:6)
 * - at myFunction4 (file-4.js:7:8)
 *
 * Returned value: { file: 'file-3.js', line: 5, column: 6 }
 */
export function getLocationInFile(filePath: string) {
  const filePathUrl = url.pathToFileURL(filePath).toString();
  return getLocationBy((stackFrames) => {
    return stackFrames.find((frame) => {
      const frameFile = frame.getFileName();
      return frameFile === filePath || frameFile === filePathUrl;
    });
  });
}

export function getLocationByOffset(offset: number) {
  return getLocationBy((stackFrames) => stackFrames[offset]);
}

/**
 * Iterates stacktrace of the call of this function
 * and finds frame using provided findFrame predicate.
 * Constructs location object from the found frame.
 *
 * This function is based on Playwright's wrapFunctionWithLocation().
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/transform/transform.ts#L261
 */
function getLocationBy(findFrame: (stackFrame: NodeJS.CallSite[]) => NodeJS.CallSite | undefined) {
  const { sourceMapSupport } = requirePlaywrightModule('lib/utilsBundle.js');
  const oldPrepareStackTrace = Error.prepareStackTrace;
  // modify prepareStackTrace to return Location object instead of string
  Error.prepareStackTrace = (error, stackFrames) => {
    const foundFrame = findFrame(stackFrames);
    if (!foundFrame) return { file: '', line: 0, column: 0 };
    const frame: NodeJS.CallSite = sourceMapSupport.wrapCallSite(foundFrame);
    const fileName = frame.getFileName();
    // Node error stacks for modules use file:// urls instead of paths.
    const file = fileName?.startsWith('file://') ? url.fileURLToPath(fileName) : fileName;
    return {
      file,
      line: frame.getLineNumber(),
      column: frame.getColumnNumber(),
    };
  };
  // commented stackTraceLImit modification, todo: check if it has perf impact
  // const oldStackTraceLimit = Error.stackTraceLimit;
  // Error.stackTraceLimit = level + 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: { stack: PlaywrightLocation } = {} as any;
  Error.captureStackTrace(obj);
  const location = obj.stack;
  // Error.stackTraceLimit = oldStackTraceLimit;
  Error.prepareStackTrace = oldPrepareStackTrace;
  return location;
}
