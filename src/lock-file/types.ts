export type LockOwner = {
  createdAt: number;
  pid: number;
  token: string;
  workerIndex?: number;
};

export type LockSnapshot = {
  content: string;
  mtimeMs: number;
  owner?: LockOwner;
};

export type AcquiredLock = LockOwner & {
  lockDir: string;
  lockPath: string;
  outputDir: string;
};
