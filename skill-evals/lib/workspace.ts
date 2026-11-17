import { cp, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function createWorkspace(testFile: string, testDir: string) {
  const originalPath = path.join(path.dirname(testFile), 'workspace');
  const workspaceDir = path.join(testDir, 'workspace');
  await cp(originalPath, workspaceDir, { recursive: true });
  return new Workspace(workspaceDir, originalPath);
}

export class Workspace {
  readonly path: string;
  private readonly originalPath: string;

  constructor(workspaceDir: string, originalPath: string) {
    this.path = workspaceDir;
    this.originalPath = originalPath;
  }

  async read(file: string) {
    const resolved = path.resolve(this.path, file);
    if (!resolved.startsWith(this.path + path.sep)) throw new Error(`Outside workspace: ${file}`);
    return readFile(resolved, 'utf8');
  }

  async diff() {
    const [original, current] = await Promise.all([
      listFiles(this.originalPath),
      listFiles(this.path),
    ]);
    const modified: string[] = [];
    for (const file of current) {
      if (!original.has(file)) continue;
      const [before, after] = await Promise.all([
        readFile(path.join(this.originalPath, file)),
        readFile(path.join(this.path, file)),
      ]);
      if (!before.equals(after)) modified.push(file);
    }
    return {
      created: [...current].filter((file) => !original.has(file)).sort(),
      modified: modified.sort(),
      deleted: [...original].filter((file) => !current.has(file)).sort(),
    };
  }
}

async function listFiles(root: string, relative = '', files = new Set<string>()) {
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const file = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await listFiles(root, file, files);
    else if (entry.isFile()) files.add(file);
    else throw new Error(`Workspace supports only regular files and directories: ${file}`);
  }
  return files;
}
