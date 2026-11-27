/** Word-based index for fast step-definition matching. */
import { matchDefinitions, StepDefinition, StepMatchInput } from '../stepDefinition';
import { MatchedStepDefinition } from '../matchedStepDefinition';
import { getRequiredLiterals } from './requiredLiterals';

let indexedDefinitions: StepDefinition[] | null = null;
let indexedLength = -1;
let wordBuckets = new Map<string, StepDefinition[]>();
let scanList: StepDefinition[] = [];

export function matchWithStepIndex(
  definitions: StepDefinition[],
  step: StepMatchInput,
): MatchedStepDefinition[] {
  ensureIndex(definitions);
  return matchDefinitions(candidatesFor(step.text), step);
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
  // Save the index only when every expression compiles. One bad pattern must not hide later steps.
  const nextWordBuckets = new Map<string, StepDefinition[]>();
  const nextScanList: StepDefinition[] = [];
  for (const definition of definitions) {
    addToIndex(definition, nextWordBuckets, nextScanList);
  }
  indexedDefinitions = definitions;
  indexedLength = definitions.length;
  wordBuckets = nextWordBuckets;
  scanList = nextScanList;
}

function addToIndex(
  definition: StepDefinition,
  nextWordBuckets: Map<string, StepDefinition[]>,
  nextScanList: StepDefinition[],
) {
  const word = pickLongest(getRequiredLiterals(definition));
  if (!word) {
    nextScanList.push(definition);
    return;
  }
  const bucket = nextWordBuckets.get(word);
  if (bucket) bucket.push(definition);
  else nextWordBuckets.set(word, [definition]);
}

// Shorter words are shared by too many definitions to shrink the candidate set.
const MIN_INDEX_WORD_LENGTH = 8;
const LONG_WORD = new RegExp(`[A-Za-z][A-Za-z0-9]{${MIN_INDEX_WORD_LENGTH - 1},}`, 'g');

function pickLongest(literals: string[]): string | null {
  return longestWord(literals.flatMap(longWords));
}

function longWords(text: string): string[] {
  return text.match(LONG_WORD) ?? [];
}

function longestWord(words: string[]): string | null {
  let best = '';
  for (const word of words) {
    if (word.length > best.length) best = word;
  }
  return best || null;
}
