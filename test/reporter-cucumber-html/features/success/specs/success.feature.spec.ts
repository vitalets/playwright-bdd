import { expect } from '@playwright/test';
import { test } from '../../../check-report/fixtures';

test('Feature tags', async ({ feature }) => {
  await expect(feature.getTags()).toHaveText(['@feature-tag']);
});

// Cucumber html-formatter does not show failed retries
// See: https://github.com/cucumber/react-components/issues/75
test('Scenario with retries', async ({ scenario }) => {
  await expect(scenario.getSteps()).toHaveText([
    'GivenAction 1',
    'Andfails until retry 1',
    'AndAction 2',
    '', // empty step b/c we have 'After Hooks' hook added to the testCase b/c of screenshot in failed attempt
  ]);
  await expect(scenario.getSteps()).toHaveCount(4);
  await expect(scenario.getSteps('passed')).toHaveCount(3);
});

test('Scenario with data table', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText(['Step with data table']);
  await expect(scenario.getDataTable().getByRole('cell')).toHaveText([
    'name',
    'value',
    'foo',
    'bar',
    'x',
    '42',
  ]);
});

test('Scenario with doc string', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText(['Step with doc string']);
  await expect(scenario.getDocString()).toHaveText('some text');
});

test('Scenario with attachments', async ({ scenario }) => {
  await expect(scenario.getSteps()).toContainText([
    'attach text',
    'attach image inline',
    'attach image as file',
  ]);
  await expect(scenario.getAttachments()).toHaveText([
    'text attachmentsome text', // no space between 'attachment' and 'some'
    'image attachment inline',
    'image attachment as file',
  ]);
  await expect(scenario.getLogs()).toContainText('123 some logs');
  await expect(scenario.getLogs()).toContainText('logs from exec');
});

test('Scenario with all keywords and success hooks', async ({ scenario }) => {
  await expect(scenario.getSteps('passed')).toHaveCount(7);
  await expect(scenario.getSteps()).toHaveText([
    '', // before hook
    'GivenAction 1',
    'AndAction 2',
    'WhenAction 3',
    'AndAction 4',
    'ThenAction 5',
    'ButAction 6',
    '*Action 7',
    '', // after hook
  ]);
});

test('Skipped scenario', async ({ scenario }) => {
  await expect(scenario.getSteps('skipped')).toHaveCount(2);
});

test('Check doubled', async ({ feature }) => {
  const scenario = feature.getScenarioOutline('Check doubled');
  await expect(scenario.getSteps()).toContainText([
    'GivenAction <start>', // prettier-ignore
    'ThenAction <end>',
  ]);
  await expect(scenario.getExamples().nth(0).getByRole('cell')).toContainText([
    ' ',
    'start',
    'end',
    '',
    '2',
    '4',
    '',
    '3',
    '6',
  ]);
  await expect(scenario.getExamples().nth(1).getByRole('cell')).toContainText([
    ' ',
    'start',
    'end',
    '',
    '10',
    '20',
  ]);
});
