export const calls: string[] = [];

export function track(hookTitle: string) {
  calls.push(hookTitle);
}
