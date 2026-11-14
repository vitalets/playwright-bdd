export const GENERATION_LOCK_FILE = 'generation.lock';
export const EXECUTION_LOCK_RE = /^execution\.(\d+)-([0-9a-f-]+)\.lock$/;
export const RETRY_INTERVAL_MS = 100;
export const INVALID_LOCK_GRACE_MS = 1_000;
