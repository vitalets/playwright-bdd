/**
 * Extract literal chunks from a Cucumber Expression pattern,
 * skipping {parameters}, (...) groups, and :namedParams.
 * For patterns with / alternatives, only words shared across
 * every alternative are returned.
 */

// Shorter words (clicks, taps, button) are shared by too many definitions to shrink the candidate set.
const MIN_INDEX_WORD_LENGTH = 8;
const LONG_WORD = new RegExp(`[A-Za-z][A-Za-z0-9]{${MIN_INDEX_WORD_LENGTH - 1},}`, 'g');

export function longWords(text: string): string[] {
  LONG_WORD.lastIndex = 0;
  return text.match(LONG_WORD) ?? [];
}

export function cucumberChunks(pattern: string): string[] {
  const alternatives = splitAlternatives(pattern);
  if (!alternatives) return [];
  if (alternatives.length === 1) return literalChunks(alternatives[0]);
  return sharedWords(alternatives);
}

function sharedWords(alternatives: string[]): string[] {
  let shared: Set<string> | null = null;
  for (const alternative of alternatives) {
    const words = collectWords(alternative);
    shared = shared ? intersect(shared, words) : words;
  }
  return shared ? [...shared] : [];
}

function collectWords(alternative: string): Set<string> {
  const words = new Set<string>();
  for (const chunk of literalChunks(alternative)) {
    for (const word of longWords(chunk)) words.add(word);
  }
  return words;
}

function intersect(base: Set<string>, other: Set<string>): Set<string> {
  for (const word of base) {
    if (!other.has(word)) base.delete(word);
  }
  return base;
}

type ParseState = { chunks: string[]; current: string; cursor: number };

function literalChunks(pattern: string): string[] {
  const state: ParseState = { chunks: [], current: '', cursor: 0 };
  while (state.cursor < pattern.length) {
    if (!consumeNext(pattern, state)) return [];
  }
  if (state.current) state.chunks.push(state.current);
  return state.chunks;
}

const CONSUME_MAP: Record<string, (p: string, s: ParseState) => boolean> = {
  '\\': consumeEscape,
  '{': consumeParam,
  '(': consumeGroup,
  ':': consumeNamedParam,
};

function consumeNext(pattern: string, state: ParseState): boolean {
  const character = pattern[state.cursor];
  if (character === ')') return false;
  const handler = CONSUME_MAP[character!];
  if (handler) return handler(pattern, state);
  state.current += character;
  state.cursor++;
  return true;
}

function consumeEscape(pattern: string, state: ParseState): boolean {
  const escaped = pattern[state.cursor + 1];
  if (escaped === undefined) return false;
  state.current += escaped;
  state.cursor += 2;
  return true;
}

function consumeParam(pattern: string, state: ParseState): boolean {
  const close = pattern.indexOf('}', state.cursor + 1);
  if (close === -1) return false;
  flushCurrent(state);
  state.cursor = close + 1;
  return true;
}

function consumeGroup(pattern: string, state: ParseState): boolean {
  const close = findGroupEnd(pattern, state.cursor);
  if (close === -1) return false;
  flushCurrent(state);
  state.cursor = close + 1;
  return true;
}

function consumeNamedParam(pattern: string, state: ParseState): boolean {
  const rest = pattern.slice(state.cursor + 1);
  const identMatch = /^[A-Za-z_]\w*/.exec(rest);
  if (!identMatch) {
    state.current += ':';
    state.cursor++;
    return true;
  }
  flushCurrent(state);
  state.cursor += 1 + identMatch[0].length;
  return true;
}

function flushCurrent(state: ParseState) {
  if (state.current) state.chunks.push(state.current);
  state.current = '';
}

function findGroupEnd(pattern: string, openIndex: number): number {
  let depth = 0;
  for (let cursor = openIndex; cursor < pattern.length; cursor++) {
    cursor = skipEscapeInGroup(pattern, cursor);
    depth = updateGroupDepth(pattern[cursor], depth);
    if (depth === 0 && cursor > openIndex) return cursor;
  }
  return -1;
}

function skipEscapeInGroup(pattern: string, cursor: number): number {
  return pattern[cursor] === '\\' ? cursor + 1 : cursor;
}

function updateGroupDepth(character: string | undefined, depth: number): number {
  if (character === '(') return depth + 1;
  if (character === ')') return depth - 1;
  return depth;
}

type AltState = { parts: string[]; current: string; depth: number };

function splitAlternatives(pattern: string): string[] | null {
  const state: AltState = { parts: [], current: '', depth: 0 };
  for (let cursor = 0; cursor < pattern.length; cursor++) {
    const result = processAltChar(pattern, cursor, state);
    if (result === null) return null;
    cursor = result;
  }
  state.parts.push(state.current);
  return state.parts;
}

function processAltChar(pattern: string, cursor: number, state: AltState): number | null {
  const character = pattern[cursor];
  if (character === '\\') return handleAltEscape(pattern, cursor, state);
  return classifyAltChar(character!, cursor, state);
}

function classifyAltChar(character: string, cursor: number, state: AltState): number {
  if (isAltOpen(character)) return openAltGroup(character, cursor, state);
  if (isAltClose(character) && state.depth > 0) return closeAltGroup(character, cursor, state);
  if (character === '/') return handleAltSlash(cursor, state);
  state.current += character;
  return cursor;
}

function handleAltSlash(cursor: number, state: AltState): number {
  if (state.depth === 0) return splitAltHere(cursor, state);
  state.current += '/';
  return cursor;
}

function openAltGroup(character: string, cursor: number, state: AltState): number {
  state.depth++;
  state.current += character;
  return cursor;
}

function closeAltGroup(character: string, cursor: number, state: AltState): number {
  state.depth--;
  state.current += character;
  return cursor;
}

function splitAltHere(cursor: number, state: AltState): number {
  state.parts.push(state.current);
  state.current = '';
  return cursor;
}

function isAltOpen(character: string): boolean {
  return character === '(' || character === '{';
}

function isAltClose(character: string): boolean {
  return character === ')' || character === '}';
}

function handleAltEscape(pattern: string, cursor: number, state: AltState): number | null {
  const escaped = pattern[cursor + 1];
  if (escaped === undefined) return null;
  state.current += '\\' + escaped;
  return cursor + 1;
}
