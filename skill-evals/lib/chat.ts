import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Agent, AgentResponse } from './agents/types.ts';

export class Chat {
  private readonly agent: Agent;
  private readonly testDir: string;
  private readonly messages: Message[] = [];
  private busy = false;
  private failed = false;

  constructor(agent: Agent, testDir: string) {
    this.agent = agent;
    this.testDir = testDir;
  }

  get history() {
    return [...this.messages];
  }

  get assistantText() {
    return this.messages
      .filter((message) => message.role === 'assistant')
      .map((message) => message.text)
      .join('\n\n');
  }

  async send(message: string) {
    if (this.busy) throw new Error('Await chat.send() before sending another message.');
    if (this.failed)
      throw new Error('Cannot continue a failed conversation. Create a new evaluation.');
    this.busy = true;
    this.messages.push({ role: 'user', text: message });
    try {
      await this.saveHistory();
      const response = await this.agent.send(message);
      this.messages.push({ role: 'assistant', ...response });
      await this.saveHistory();
      return response;
    } catch (error) {
      this.failed = true;
      await writeFile(path.join(this.testDir, 'error.txt'), String(error));
      throw error;
    } finally {
      this.busy = false;
    }
  }

  private saveHistory() {
    return writeFile(
      path.join(this.testDir, 'messages.json'),
      JSON.stringify(this.messages, null, 2),
    );
  }
}

type Message = { role: 'user'; text: string } | ({ role: 'assistant' } & AgentResponse);
