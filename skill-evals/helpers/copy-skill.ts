import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function copySkill(workspacePath: string) {
  const destination = path.join(workspacePath, '.agents/skills/playwright-bdd');
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(new URL('../../skills/playwright-bdd/', import.meta.url), destination, {
    recursive: true,
  });
}
