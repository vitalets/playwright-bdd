import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { StepDefinition } from '../../node_modules/playwright-bdd/dist/steps/stepDefinition';

type MatchCounts = Record<string, Record<string, { calls: number; matches: number }>>;

export function trackMatchCalls() {
  const file = join(__dirname, '..', 'actual-reports', 'match-calls.json');
  mkdirSync(dirname(file), { recursive: true });

  const counts: MatchCounts = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};

  const matchStep = StepDefinition.prototype.matchStep;
  StepDefinition.prototype.matchStep = function (step) {
    const match = matchStep.call(this, step);
    const candidates = (counts[step.text] ??= {});
    const candidate = (candidates[this.patternString] ??= { calls: 0, matches: 0 });
    candidate.calls++;
    if (match) candidate.matches++;
    writeFileSync(file, JSON.stringify(counts, null, 2));
    return match;
  };
}
