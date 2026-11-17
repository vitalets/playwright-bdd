import { beforeEach } from 'node:test';
import { createEval } from './lib/index.ts';
import { copySkill } from './helpers/copy-skill.ts';

declare module 'node:test' {
  interface TestContext {
    eval: Awaited<ReturnType<typeof createEval>>;
  }
}

beforeEach(async (t) => {
  if (!('test' in t)) throw new Error('Evaluation setup requires a test context.');
  t.eval = await createEval(t);
  await copySkill(t.eval.workspace.path);
});
