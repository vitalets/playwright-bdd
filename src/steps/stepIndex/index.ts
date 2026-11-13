/**
 * Word-based index for fast step-definition matching.
 * Activated by `--use-step-index` or `useStepIndex`.
 * Built once per definition list and kept until the process exits.
 */
import { StepDefinition, StepMatchInput } from '../stepDefinition';
import { MatchedStepDefinition } from '../matchedStepDefinition';
import { cucumberChunks, longWords } from './cucumberChunks';
import { regexpChunks } from './regexpChunks';

let indexedDefinitions: StepDefinition[] | null = null;
let indexedLength = -1;
let wordBuckets = new Map<string, StepDefinition[]>();
let scanList: StepDefinition[] = [];

export function matchWithStepIndex(
  definitions: StepDefinition[],
  step: StepMatchInput,
): MatchedStepDefinition[] {
  ensureIndex(definitions);
  return matchCandidates(step);
}

function matchCandidates(step: StepMatchInput): MatchedStepDefinition[] {
  const matched: MatchedStepDefinition[] = [];
  for (const definition of candidatesFor(step.text)) {
    const match = definition.matchStep(step);
    if (match) matched.push(match);
  }
  return matched;
}

function candidatesFor(stepText: string): StepDefinition[] {
  const candidates: StepDefinition[] = [...scanList];
  for (const [word, bucket] of wordBuckets) {
    if (stepText.includes(word)) candidates.push(...bucket);
  }
  return candidates;
}

function ensureIndex(definitions: StepDefinition[]) {
  if (definitions === indexedDefinitions && definitions.length === indexedLength) return;
  rebuildIndex(definitions);
}

function rebuildIndex(definitions: StepDefinition[]) {
  indexedDefinitions = definitions;
  indexedLength = definitions.length;
  wordBuckets = new Map();
  scanList = [];
  for (const definition of definitions) addToIndex(definition);
}

function addToIndex(definition: StepDefinition) {
  const word = indexWord(definition);
  if (!word) {
    scanList.push(definition);
    return;
  }
  const bucket = wordBuckets.get(word);
  if (bucket) bucket.push(definition);
  else wordBuckets.set(word, [definition]);
}

function indexWord(definition: StepDefinition): string | null {
  // BDD Expressions (`[click/tap on]`, `:name`) are a different grammar.
  // Indexing them with the Cucumber parser can require a word from one alternative only.
  if (definition.usesBddExpression()) return null;
  const chunks = extractChunks(definition.pattern);
  return pickLongestWord(chunks);
}

function extractChunks(pattern: string | RegExp): string[] {
  if (typeof pattern === 'string') return cucumberChunks(pattern);
  if (pattern instanceof RegExp && !/[im]/.test(pattern.flags)) {
    return regexpChunks(pattern.source);
  }
  return [];
}

function pickLongestWord(chunks: string[]): string | null {
  let best = '';
  for (const chunk of chunks) best = longestInChunk(chunk, best);
  return best || null;
}

function longestInChunk(chunk: string, best: string): string {
  for (const word of longWords(chunk)) {
    if (word.length > best.length) best = word;
  }
  return best;
}
