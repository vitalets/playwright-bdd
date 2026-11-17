import test from 'node:test';
import assert from 'node:assert/strict';
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createEval, codex } from '../index.ts';
import { createTestContext } from '../test-context.ts';

test('isolates shared fixtures and tracks cumulative file changes and conversation', async (t) => {
  const prompts: string[] = [];
  const agent = () => ({
    async send(message: string) {
      prompts.push(message);
      return { text: `Response ${prompts.length}` };
    },
  });
  const first = await createEval(t, undefined, { agent });
  await writeFile(path.join(first.workspace.path, 'setup.txt'), 'ready');
  const second = await createEval({ name: 'Another test sharing the fixture' }, import.meta.url, {
    agent,
  });
  assert.equal(await first.workspace.read('setup.txt'), 'ready');
  assert.notEqual(first.workspace.path, second.workspace.path);
  assert.deepEqual(await first.workspace.diff(), {
    created: ['setup.txt'],
    modified: [],
    deleted: [],
  });
  await first.chat.send('First');
  assert.deepEqual(await first.workspace.diff(), {
    created: ['setup.txt'],
    modified: [],
    deleted: [],
  });
  await writeFile(path.join(first.workspace.path, 'seed.txt'), 'changed');
  await writeFile(path.join(first.workspace.path, 'new.txt'), 'New file');
  assert.equal(await second.workspace.read('seed.txt'), 'initial\n');
  assert.deepEqual(await first.workspace.diff(), {
    created: ['new.txt', 'setup.txt'],
    modified: ['seed.txt'],
    deleted: [],
  });
  await rm(path.join(first.workspace.path, 'seed.txt'));
  assert.deepEqual((await first.workspace.diff()).deleted, ['seed.txt']);
  await assert.rejects(first.workspace.read('../outside'), /Outside workspace/);
  await first.chat.send('Second');
  assert.equal(prompts[0], 'First');
  assert.equal(prompts[1], 'Second');
  assert.deepEqual(
    first.chat.history.map(({ text }) => text),
    ['First', 'Response 1', 'Second', 'Response 2'],
  );
  assert.equal(first.chat.assistantText, 'Response 1\n\nResponse 2');
});

test('keeps outputs after each turn and resets only the selected test before its next run', async () => {
  const context = { title: 'Revises documents: after feedback' };
  const options = {
    agent: () => ({
      async send() {
        return { text: 'Proposed documents' };
      },
    }),
  };
  const first = await createEval(context, import.meta.url, options);
  const outputDir = path.dirname(first.workspace.path);
  assert.equal(path.basename(outputDir), 'Revises-documents-after-feedback');
  assert.equal(path.basename(path.dirname(outputDir)), 'test-results');
  assert.deepEqual(Object.keys(first).sort(), ['chat', 'workspace']);
  await first.chat.send('Generate documents');
  assert.deepEqual(
    JSON.parse(await readFile(path.join(outputDir, 'messages.json'), 'utf8')),
    first.chat.history,
  );
  await writeFile(path.join(first.workspace.path, 'leftover.txt'), 'previous run');
  const unrelated = await createEval({ name: 'Unrelated test output' }, import.meta.url, options);
  await writeFile(path.join(unrelated.workspace.path, 'keep.txt'), 'retained');

  // A new test context represents a new run of the same test.
  const next = await createEval({ ...context }, import.meta.url, options);
  assert.equal(next.workspace.path, first.workspace.path);
  await assert.rejects(next.workspace.read('leftover.txt'), { code: 'ENOENT' });
  assert.equal(await next.workspace.read('seed.txt'), 'initial\n');
  assert.deepEqual(next.chat.history, []);
  await assert.rejects(readFile(path.join(outputDir, 'messages.json')), { code: 'ENOENT' });
  assert.equal(await unrelated.workspace.read('keep.txt'), 'retained');
});

test('retains the attempted user message and agent failure without teardown hooks', async () => {
  const { chat, workspace } = await createEval(
    { task: { name: 'Records failed turns' } },
    import.meta.url,
    {
      agent: () => ({
        async send() {
          throw new Error('Agent unavailable');
        },
      }),
    },
  );
  await assert.rejects(chat.send('Generate documents'), /Agent unavailable/);
  const outputDir = path.dirname(workspace.path);
  assert.deepEqual(JSON.parse(await readFile(path.join(outputDir, 'messages.json'), 'utf8')), [
    { role: 'user', text: 'Generate documents' },
  ]);
  assert.match(await readFile(path.join(outputDir, 'error.txt'), 'utf8'), /Agent unavailable/);
  await assert.rejects(chat.send('Try again'), /Cannot continue a failed conversation/);
});

test('detects context capabilities and forwards cancellation to the agent', async (t) => {
  let diagnostic = '';
  const context = {
    name: 'Context capabilities',
    signal: t.signal,
    diagnostic(message: string) {
      diagnostic = message;
    },
  };
  let signal: AbortSignal | undefined;
  await createEval(context, import.meta.url, {
    agent: (received) => {
      signal = received.signal;
      return {
        async send() {
          return { text: 'Done' };
        },
      };
    },
  });
  assert.equal(signal, t.signal);
  assert.match(diagnostic, /test-results/);
  assert.equal(
    createTestContext({ title: 'Playwright title', file: fileURLToPath(import.meta.url) })
      .testTitle,
    'Playwright title',
  );
  assert.equal(
    createTestContext({ task: { name: 'Vitest title' } }, import.meta.url).testTitle,
    'Vitest title',
  );
  assert.throws(() => createTestContext({}), /test context/);
});

test('resolves inferred file paths and explicit paths or file URLs', async (t) => {
  const file = fileURLToPath(import.meta.url);
  assert.equal(createTestContext(t).testPath, file);
  for (const location of [
    file,
    import.meta.url,
    new URL(import.meta.url),
    path.relative(process.cwd(), file),
  ]) {
    assert.equal(
      createTestContext({ name: 'Explicit location', filePath: '/unused.test.ts' }, location)
        .testPath,
      file,
    );
  }
  assert.throws(
    () => createTestContext({ name: 'Missing location' }),
    /Pass a filesystem path or file URL/,
  );
  assert.throws(() => createTestContext(t, new URL('https://example.com/test.ts')), /file/);
});

test('compares setup and agent changes against the original fixture across turns', async (t) => {
  const { chat, workspace } = await createEval(t, undefined, {
    agent: ({ cwd }) => ({
      async send(message) {
        await writeFile(path.join(cwd, 'generated.txt'), message);
        return { text: 'Done' };
      },
    }),
  });
  await writeFile(path.join(workspace.path, 'prepared.txt'), 'initial setup');
  assert.deepEqual(await workspace.diff(), {
    created: ['prepared.txt'],
    modified: [],
    deleted: [],
  });
  await chat.send('First');
  assert.deepEqual(await workspace.diff(), {
    created: ['generated.txt', 'prepared.txt'],
    modified: [],
    deleted: [],
  });
  await writeFile(path.join(workspace.path, 'prepared.txt'), 'changed after conversation started');
  await chat.send('Second');
  assert.deepEqual(await workspace.diff(), {
    created: ['generated.txt', 'prepared.txt'],
    modified: [],
    deleted: [],
  });
});

test('shortens long test titles without losing their distinguishing suffix', async () => {
  const prefix = 'A long test title '.repeat(12);
  const options = {
    agent: () => ({
      async send() {
        return { text: 'Done' };
      },
    }),
  };
  const first = await createEval({ name: prefix + 'one' }, import.meta.url, options);
  const second = await createEval({ name: prefix + 'two' }, import.meta.url, options);
  assert.notEqual(first.workspace.path, second.workspace.path);
  assert.ok(Buffer.byteLength(path.basename(path.dirname(first.workspace.path))) <= 100);
});

test('Codex adapter resumes the exact session and sends prompts through stdin', async (t) => {
  const { directory, executable } = await fakeCodex(
    t,
    `
    const fs = require('node:fs');
    const args = process.argv.slice(2);
    fs.appendFileSync('calls.jsonl', JSON.stringify({ args, prompt: fs.readFileSync(0, 'utf8') }) + '\\n');
    console.log(JSON.stringify({ type: 'thread.started', thread_id: 'session-123' }));
    console.log(JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Done' } }));
    console.log(JSON.stringify({ type: 'turn.completed' }));
  `,
  );
  const agent = codex({ executable })({ cwd: directory, signal: t.signal });
  assert.equal((await agent.send('first')).text, 'Done');
  assert.equal((await agent.send('second')).text, 'Done');
  const calls = (await readFile(path.join(directory, 'calls.jsonl'), 'utf8'))
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.ok(!calls[0].args.includes('resume'));
  const resumeIndex = calls[1].args.indexOf('resume');
  assert.equal(calls[1].args[resumeIndex + 1], 'session-123');
  assert.deepEqual(
    calls.map((call) => call.prompt),
    ['first', 'second'],
  );
});

test('Codex adapter surfaces process failures, failed turns, and timeouts', async (t) => {
  for (const [script, pattern, timeout] of [
    ['process.stderr.write("login required"); process.exit(1);', /login required/, 5000],
    [
      'console.log(JSON.stringify({type: "turn.failed", error: {message: "quota"}}));',
      /quota/,
      5000,
    ],
    ['setInterval(() => {}, 1000);', /Codex execution failed/, 100],
  ] as const) {
    const { directory, executable } = await fakeCodex(t, script);
    const agent = codex({ executable, timeout })({ cwd: directory, signal: t.signal });
    await assert.rejects(agent.send('hello'), pattern);
  }
});

async function fakeCodex(t: test.TestContext, script: string) {
  const directory = await mkdtemp(path.join(tmpdir(), 'fake-codex-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const executable = path.join(directory, 'codex');
  await writeFile(executable, `#!${process.execPath}\n${script}`);
  await chmod(executable, 0o755);
  return { directory, executable };
}
