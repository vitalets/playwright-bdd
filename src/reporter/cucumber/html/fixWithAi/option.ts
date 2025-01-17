export type FixWithAiOption =
  | boolean
  | {
      prompt?: string;
      enabled?: boolean;
    };

export type ResolvedFixWithAiOption = ReturnType<typeof resolveFixWithAiOption>;

export function resolveFixWithAiOption(fixWithAi?: FixWithAiOption) {
  if (!fixWithAi) return { enabled: false };
  if (typeof fixWithAi === 'boolean') return { enabled: fixWithAi };
  return Object.assign({ enabled: true }, fixWithAi);
}
