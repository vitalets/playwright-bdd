import url from 'url';
import { requirePlaywrightModule } from './utils';

// cucumber has also Location type, but it does not contain file and column is optional.
export interface PlaywrightLocation {
  file: string;
  line: number;
  column: number;
}

/**
 * Inspects stacktrace and finds call location in provided file.
 * This function is based on Playwright's getLocationByStacktrace().
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/transform.ts#L229
 */
export function getLocationInFile(filePath: string) {
  const filePathUrl = url.pathToFileURL(filePath).toString();
  const { sourceMapSupport } = requirePlaywrightModule('lib/utilsBundle.js');
  const oldPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (error, stackFrames) => {
    const frameInFile = stackFrames.find((frame) => {
      const frameFile = frame.getFileName();
      return frameFile === filePath || frameFile === filePathUrl;
    });
    if (!frameInFile) return { file: '', line: 0, column: 0 };
    const frame: NodeJS.CallSite = sourceMapSupport.wrapCallSite(frameInFile);
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
