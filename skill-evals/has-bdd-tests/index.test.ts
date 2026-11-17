import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFeature } from '../helpers/gherkin.ts';

test('extends existing scenarios and revises them in the same conversation', async (t) => {
  const { chat, workspace } = t.eval;
  const original = parseFeature(await workspace.read('features/todo-list.feature'));
  const response = await chat.send(
    'Use the playwright-bdd skill. If a question tool is unavailable, ask in your response and wait for my next message. Extend features/todo-list.feature with a scenario for deleting a task: after deleting a task, it is absent from the list. Keep the existing scenarios and reuse their steps where possible. Save the feature file and show it for approval. Only write scenarios; do not implement the app or steps.',
  );
  assert.match(response.text, /Scenario:/i);
  const initial = parseFeature(await workspace.read('features/todo-list.feature'));
  assert.ok(
    initial.scenarios.length > original.scenarios.length,
    'Adds coverage to the existing feature',
  );

  await chat.send(
    'Revise that same feature to also cover an empty or whitespace-only task title: the user sees "Enter a task title." and no task is added. Keep all existing scenarios, including deletion. Save and show the revised scenarios for approval; do not implement anything else.',
  );
  assert.equal(chat.history.length, 4);
  assert.match(chat.assistantText, /Scenario:/i);
  const changes = await workspace.diff();
  assert.deepEqual(
    changes.created.filter((file) => file.endsWith('.feature')),
    [],
  );
  assert.deepEqual(changes.modified, ['features/todo-list.feature']);
  assert.deepEqual(changes.deleted, []);
  const { feature, scenarios } = parseFeature(await workspace.read('features/todo-list.feature'));
  assert.ok(feature.description.trim(), 'Feature describes its user-facing purpose');
  assert.ok(scenarios.length > initial.scenarios.length, 'Revision adds a negative case');
  for (const scenario of [...original.scenarios, ...initial.scenarios]) {
    assert.ok(
      scenarios.some((revised) => revised.name === scenario.name),
      'Existing scenarios are retained',
    );
  }
  const addedScenarios = scenarios.filter(
    (scenario) => !initial.scenarios.some((existing) => existing.name === scenario.name),
  );
  assert.match(
    addedScenarios.map((scenario) => scenario.steps.map((step) => step.text).join('\n')).join('\n'),
    /empty|blank|whitespace/i,
  );
});
