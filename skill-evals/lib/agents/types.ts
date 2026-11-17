export type AgentResponse = { text: string; events?: readonly unknown[] };
export type Agent = { send(message: string): Promise<AgentResponse> };
export type AgentContext = { cwd: string; signal?: AbortSignal };
