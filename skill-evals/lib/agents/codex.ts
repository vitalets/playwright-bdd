import { execFile } from 'node:child_process';

import type { Agent, AgentContext, AgentResponse } from './types.ts';

export type CodexOptions = { executable?: string; model?: string; timeout?: number };

export function codex(options: CodexOptions = {}) {
  return (context: AgentContext) => new CodexAgent(context, options);
}

export class CodexAgent implements Agent {
  private readonly context: AgentContext;
  private readonly options: CodexOptions;
  private sessionId: string | undefined;

  constructor(context: AgentContext, options: CodexOptions = {}) {
    this.context = context;
    this.options = options;
  }

  async send(message: string): Promise<AgentResponse> {
    const args = ['exec', '--sandbox', 'workspace-write', '-c', 'approval_policy="never"'];
    if (this.sessionId) args.push('resume', this.sessionId);
    args.push('--json', '--skip-git-repo-check');
    const model = this.options.model ?? process.env.CODEX_MODEL;
    if (model) args.push('--model', model);
    args.push('-');
    const output = await run(this.options.executable ?? 'codex', args, message, {
      cwd: this.context.cwd,
      signal: this.context.signal,
      timeout: this.options.timeout ?? 180_000,
    });
    const events = output
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Event);
    const text: string[] = [];
    let completed = false;
    for (const event of events) {
      if (event.type === 'thread.started') this.sessionId = event.thread_id;
      if (event.type === 'item.completed' && event.item?.type === 'agent_message') {
        text.push(event.item.text ?? '');
      }
      if (event.type === 'turn.completed') completed = true;
      if (event.type === 'turn.failed' || event.type === 'error') {
        throw new Error(`Codex failed: ${JSON.stringify(event)}`);
      }
    }
    if (!this.sessionId || !completed || !text.length) {
      throw new Error(`Incomplete Codex turn: ${output}`);
    }
    return { text: text.join('\n\n'), events };
  }
}

type Event = {
  type: string;
  thread_id?: string;
  item?: { type: string; text?: string };
};

function run(
  executable: string,
  args: string[],
  input: string,
  options: AgentContext & { timeout: number },
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      executable,
      args,
      {
        ...options,
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
        killSignal: 'SIGKILL',
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `Codex execution failed. Check CLI installation and login.\n${error.message}\n${stderr}\n${stdout}`,
              { cause: error },
            ),
          );
        } else resolve(stdout);
      },
    );
    // An early CLI exit can close stdin before the prompt has been written.
    child.stdin?.on('error', () => {});
    child.stdin?.end(input);
  });
}
