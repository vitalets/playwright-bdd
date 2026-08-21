# Watch mode

Watch mode uses one long-lived parent process and a new child process for every generation.

- The parent owns the file watcher, collects changes, and starts child processes.
- A child loads Playwright and BDD config, generates files, and exits.

Using a fresh child prevents config and imported modules from being reused from the previous generation. `child.ts` also removes `PLAYWRIGHT_BDD_CONFIGS` from the child environment so the BDD configs are rebuilt from the Playwright config.

## Generation flow

1. The parent forks a child.
2. The child loads config from disk and sends a `metadata` message containing the resolved watch settings.
3. The parent uses that metadata to create or update its Chokidar watcher. The parent does not load user config itself.
4. Immediately before generation, the child sends `ready-to-generate` and pauses.
5. The parent waits until the watcher update is complete, marks generation as started, and sends `start-generation`.
6. The child reads the source files, generates the output, and exits.
7. If relevant files changed during generation, the parent starts another fresh child.

The handshake prevents generation from starting before the watcher is ready. The `start-generation` message also establishes the boundary for handling file changes:

- Before `start-generation`, source changes are assumed to be read by the pending generation and do not schedule another child.
- A config-file change always schedules another child because the current child loaded config before the handshake.
- After `start-generation`, any relevant change schedules another child because generation may have already read the old contents.

If several changes arrive while a child is active, the parent only marks the current generation as dirty. When that child exits, the changes are coalesced into one debounced rebuild. If no child is active, the parent debounces the changes immediately and starts a new child.

## Generation locks

The point at which the child performs the handshake depends on the project configs:

- If at least one config has locking disabled, the child sends `ready-to-generate` before generating the unlocked configs. The same handshake covers any locked configs generated afterward. Changes received while waiting for those later locks schedule another child because generation has already started.
- If every config has locking enabled, the child first acquires the generation locks and waits for active tests to finish. It then sends `ready-to-generate`. Source changes received during the lock wait are handled by the pending generation instead of causing a redundant generation.

## Files

- `parent.ts`: watcher lifecycle, change coalescing, and child orchestration.
- `child.ts`: creation of a fresh generation process.
- `ipc.ts`: message types, watch metadata, and the generation handshake.
- `paths.ts`: watched roots, direct files, exclusions, and Git-ignore resolution.
- `gitIgnore.ts`: loading and applying Git-ignore rules.
- `fileFilter.ts`: extension and direct-file filtering.
