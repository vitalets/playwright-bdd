import { codex } from './agents/codex.ts';
import type { Agent, AgentContext } from './agents/types.ts';
import { Chat } from './chat.ts';
import { createWorkspace } from './workspace.ts';
import { createTestContext, type RunnerTestContext } from './test-context.ts';
import { createTestDir } from './test-dir.ts';

export type EvalOptions = {
  agent?: (context: AgentContext) => Agent;
};

export { codex, CodexAgent, type CodexOptions } from './agents/codex.ts';
export type { EvalTestContext } from './test-context.ts';
export { Chat } from './chat.ts';
export { Workspace } from './workspace.ts';
export type { Agent, AgentContext, AgentResponse } from './agents/types.ts';

export async function createEval(
  t: RunnerTestContext,
  location?: string | URL,
  options: EvalOptions = {},
) {
  const context = createTestContext(t, location);
  const testDir = await createTestDir(context);
  const workspace = await createWorkspace(context.testPath, testDir);
  const agent = (options.agent ?? codex())({ cwd: workspace.path, signal: context.signal });
  const chat = new Chat(agent, testDir);
  return { chat, workspace };
}
