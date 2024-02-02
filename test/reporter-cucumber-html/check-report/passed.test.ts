import { test, expect } from '@playwright/test';
import { getFeature, getScenario, openReport } from './helpers';

test.beforeEach(async ({ page }) => {
  await openReport(page);
});

test('Scenario: Scenario with data table', async ({ page }) => {
  const scenario = getScenario(page, 'Scenario with data table');
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

test('Scenario: Scenario with doc string', async ({ page }) => {
  const scenario = getScenario(page, 'Scenario with doc string');
  await expect(scenario.getSteps()).toContainText(['Step with doc string']);
  await expect(scenario.getDocString()).toHaveText('some text');
});

test('Scenario: Scenario with different attachments', async ({ page }) => {
  const scenario = getScenario(page, 'Scenario with different attachments');
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
});

test('Scenario: Scenario with all keywords', async ({ page }) => {
  const scenario = getScenario(page, 'Scenario with all keywords');
  await expect(scenario.getSteps('passed')).toHaveCount(7);
  await expect(scenario.getSteps()).toContainText([
    'GivenAction 1',
    'AndAction 2',
    'WhenAction 3',
    'AndAction 4',
    'ThenAction 5',
    'ButAction 6',
    '*Action 7',
  ]);
});

test('Scenario Outline: Check doubled', async ({ page }) => {
  const scenario = getFeature(page).getScenarioOutline('Check doubled');
  await expect(scenario.getSteps()).toContainText(['GivenAction <start>', 'ThenAction <end>']);
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
