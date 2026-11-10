/**
 * Extract literal chunks from a RegExp source string.
 * Returns [] (no safe word) for patterns with top-level alternation,
 * case-insensitive flags, or unknown escapes.
 */

type ParseState = {
  chunks: string[];
  current: string;
  depth: number;
  cursor: number;
};

export function regexpChunks(source: string): string[] {
  const state: ParseState = { chunks: [], current: '', depth: 0, cursor: 0 };
  while (state.cursor < source.length) {
    if (!processChar(source, state)) return [];
  }
  if (state.depth !== 0) return [];
  flushCurrent(state);
  return state.chunks;
}

const CHAR_HANDLERS: Record<string, (s: string, st: ParseState) => boolean> = {
  '\\': handleEscape,
  '[': handleCharClass,
  '(': handleGroupOpen,
  ')': handleGroupClose,
};

function processChar(source: string, state: ParseState): boolean {
  const character = source[state.cursor];
  const handler = CHAR_HANDLERS[character!];
  if (handler) return handler(source, state);
  if (state.depth > 0) {
    state.cursor++;
    return true;
  }
  if (character === '|') return false;
  return handleLiteral(source, state);
}

function handleEscape(source: string, state: ParseState): boolean {
  const escaped = source[state.cursor + 1];
  if (escaped === undefined) return false;
  if (state.depth > 0) {
    state.cursor += 2;
    return true;
  }
  return classifyEscape(escaped, state);
}

function classifyEscape(escaped: string, state: ParseState): boolean {
  if (/[ckux]/.test(escaped)) return false;
  if (/[A-Za-z0-9]/.test(escaped)) {
    flushCurrent(state);
    state.cursor += 2;
    return true;
  }
  state.current += escaped;
  state.cursor += 2;
  return true;
}

function handleCharClass(source: string, state: ParseState): boolean {
  flushIfTopLevel(state);
  const next = skipCharClass(source, state.cursor);
  if (next === -1) return false;
  state.cursor = next;
  return true;
}

function handleGroupOpen(_source: string, state: ParseState): boolean {
  flushIfTopLevel(state);
  state.depth++;
  state.cursor++;
  return true;
}

function handleGroupClose(source: string, state: ParseState): boolean {
  if (state.depth === 0) return false;
  state.depth--;
  state.cursor++;
  if (state.depth === 0) skipTopLevelQuantifier(source, state);
  return true;
}

function handleLiteral(source: string, state: ParseState): boolean {
  const character = source[state.cursor];
  if (isAnchor(character)) {
    state.cursor++;
    return true;
  }
  if (character === '.') {
    flushCurrent(state);
    state.cursor++;
    return true;
  }
  if (isQuantifier(character)) return handleQuantifier(source, state);
  state.current += character;
  state.cursor++;
  return true;
}

function handleQuantifier(source: string, state: ParseState): boolean {
  const character = source[state.cursor];
  state.current = state.current ? state.current.slice(0, -1) : '';
  flushCurrent(state);
  state.cursor = character === '{' ? skipBraceQuantifier(source, state.cursor) : state.cursor + 1;
  return true;
}

function isAnchor(character: string | undefined): boolean {
  return character === '^' || character === '$';
}

function isQuantifier(character: string | undefined): boolean {
  return character === '*' || character === '+' || character === '?' || character === '{';
}

function flushCurrent(state: ParseState) {
  if (state.current) state.chunks.push(state.current);
  state.current = '';
}

function flushIfTopLevel(state: ParseState) {
  if (state.depth === 0) flushCurrent(state);
}

function skipTopLevelQuantifier(source: string, state: ParseState) {
  if (isQuantifier(source[state.cursor])) {
    state.cursor = skipBraceQuantifier(source, state.cursor);
  }
}

function skipCharClass(source: string, start: number): number {
  let cursor = start + 1;
  cursor = skipCharClassPrefix(source, cursor);
  return scanToClassEnd(source, cursor);
}

function skipCharClassPrefix(source: string, cursor: number): number {
  if (source[cursor] === '^') cursor++;
  if (source[cursor] === ']') cursor++;
  return cursor;
}

function scanToClassEnd(source: string, cursor: number): number {
  while (cursor < source.length) {
    if (source[cursor] === '\\') {
      cursor += 2;
      continue;
    }
    if (source[cursor] === ']') return cursor + 1;
    cursor++;
  }
  return -1;
}

function skipBraceQuantifier(source: string, start: number): number {
  if (source[start] !== '{') return start + 1;
  const close = source.indexOf('}', start + 1);
  return close === -1 ? source.length : close + 1;
}
