/**
 * Based on Playwright's stackTrace.ts
 * See: https://github.com/microsoft/playwright/blob/release-1.51/packages/playwright-core/src/utils/isomorphic/stackTrace.ts
 */

/* eslint-disable max-lines-per-function, max-statements, visual/complexity, max-depth */

export type RawStack = string[];

export type StackFrame = {
  file: string;
  line: number;
  column: number;
  function?: string;
};

export function captureRawStack(): RawStack {
  const stackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = 50;
  const error = new Error();
  const stack = error.stack || '';
  Error.stackTraceLimit = stackTraceLimit;
  return stack.split('\n');
}

export function parseStackFrame(
  text: string,
  pathSeparator: string,
  showInternalStackFrames: boolean,
): StackFrame | null {
  const match = text && text.match(re);
  if (!match) return null;

  let fname = match[2];
  let file = match[7];
  if (!file) return null;
  if (!showInternalStackFrames && (file.startsWith('internal') || file.startsWith('node:')))
    return null;

  const line = match[8];
  const column = match[9];
  const closeParen = match[11] === ')';

  const frame: StackFrame = {
    file: '',
    line: 0,
    column: 0,
  };

  if (line) frame.line = Number(line);

  if (column) frame.column = Number(column);

  if (closeParen && file) {
    // make sure parens are balanced
    // if we have a file like "asdf) [as foo] (xyz.js", then odds are
    // that the fname should be += " (asdf) [as foo]" and the file
    // should be just "xyz.js"
    // walk backwards from the end to find the last unbalanced (
    let closes = 0;
    for (let i = file.length - 1; i > 0; i--) {
      if (file.charAt(i) === ')') {
        closes++;
      } else if (file.charAt(i) === '(' && file.charAt(i - 1) === ' ') {
        closes--;
        if (closes === -1 && file.charAt(i - 1) === ' ') {
          const before = file.slice(0, i - 1);
          const after = file.slice(i + 1);
          file = after;
          fname += ` (${before}`;
          break;
        }
      }
    }
  }

  if (fname) {
    const methodMatch = fname.match(methodRe);
    if (methodMatch) fname = methodMatch[1];
  }

  if (file) {
    if (file.startsWith('file://')) file = fileURLToPath(file, pathSeparator);
    frame.file = file;
  }

  if (fname) frame.function = fname;

  return frame;
}

export function rewriteErrorMessage<E extends Error>(e: E, newMessage: string): E {
  const lines: string[] = (e.stack?.split('\n') || []).filter((l) => l.startsWith('    at '));
  e.message = newMessage;
  const errorTitle = `${e.name}: ${e.message}`;
  if (lines.length) e.stack = `${errorTitle}\n${lines.join('\n')}`;
  return e;
}

export function stringifyStackFrames(frames: StackFrame[]): string[] {
  const stackLines: string[] = [];
  for (const frame of frames) {
    if (frame.function)
      stackLines.push(`    at ${frame.function} (${frame.file}:${frame.line}:${frame.column})`);
    else stackLines.push(`    at ${frame.file}:${frame.line}:${frame.column}`);
  }
  return stackLines;
}

export function splitErrorMessage(message: string): { name: string; message: string } {
  const separationIdx = message.indexOf(':');
  return {
    name: separationIdx !== -1 ? message.slice(0, separationIdx) : '',
    message:
      separationIdx !== -1 && separationIdx + 2 <= message.length
        ? message.substring(separationIdx + 2)
        : message,
  };
}

export function parseErrorStack(
  stack: string,
  pathSeparator: string,
  showInternalStackFrames: boolean = false,
): {
  message: string;
  stackLines: string[];
  location?: StackFrame;
} {
  const lines = stack.split('\n');
  let firstStackLine = lines.findIndex((line) => line.startsWith('    at '));
  if (firstStackLine === -1) firstStackLine = lines.length;
  const message = lines.slice(0, firstStackLine).join('\n');
  const stackLines = lines.slice(firstStackLine);
  let location: StackFrame | undefined;
  for (const line of stackLines) {
    const frame = parseStackFrame(line, pathSeparator, showInternalStackFrames);
    if (!frame || !frame.file) continue;
    if (belongsToNodeModules(frame.file, pathSeparator)) continue;
    location = { file: frame.file, column: frame.column || 0, line: frame.line || 0 };
    break;
  }
  return { message, stackLines, location };
}

function belongsToNodeModules(file: string, pathSeparator: string) {
  return file.includes(`${pathSeparator}node_modules${pathSeparator}`);
}

const re = new RegExp(
  '^' +
    // Sometimes we strip out the '    at' because it's noisy
    '(?:\\s*at )?' +
    // $1 = ctor if 'new'
    '(?:(new) )?' +
    // $2 = function name (can be literally anything)
    // May contain method at the end as [as xyz]
    '(?:(.*?) \\()?' +
    // (eval at <anonymous> (file.js:1:1),
    // $3 = eval origin
    // $4:$5:$6 are eval file/line/col, but not normally reported
    '(?:eval at ([^ ]+) \\((.+?):(\\d+):(\\d+)\\), )?' +
    // file:line:col
    // $7:$8:$9
    // $10 = 'native' if native
    '(?:(.+?):(\\d+):(\\d+)|(native))' +
    // maybe close the paren, then end
    // if $11 is ), then we only allow balanced parens in the filename
    // any imbalance is placed on the fname.  This is a heuristic, and
    // bound to be incorrect in some edge cases.  The bet is that
    // having weird characters in method names is more common than
    // having weird characters in filenames, which seems reasonable.
    '(\\)?)$',
);

const methodRe = /^(.*?) \[as (.*?)\]$/;

function fileURLToPath(fileUrl: string, pathSeparator: string): string {
  if (!fileUrl.startsWith('file://')) return fileUrl;

  let path = decodeURIComponent(fileUrl.slice(7));
  if (path.startsWith('/') && /^[a-zA-Z]:/.test(path.slice(1))) path = path.slice(1);

  return path.replace(/\//g, pathSeparator);
}
