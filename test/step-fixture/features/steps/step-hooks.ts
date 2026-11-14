import { expect } from '@playwright/test';
import type { BddTestFixtures } from 'playwright-bdd';
import { Before, After, BeforeStep, AfterStep } from './fixtures';

Before(({ $step }) => {
  expect($step.title).toBe('');
  expect($step.docStringType).toBeUndefined();
  expect($step.docString).toBeUndefined();
  expect($step.dataTable).toBeUndefined();
  expect($step.error).toBeUndefined();
  expect(() => $step.info).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.attach('outside')).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.skip()).toThrow('available only in BDD steps and step hooks');
});

BeforeStep({ name: 'inspect step fixture before body' }, ({ $step }) => {
  expect($step.error).toBeUndefined();
  expect($step.info).toBeDefined();
  checkDocStringAndDataTable($step);
});

AfterStep({ name: 'inspect step fixture after body' }, ({ $step }) => {
  expect($step.info).toBeDefined();
  expect($step.error).toBeUndefined();
  checkDocStringAndDataTable($step);
});

After(({ $step }) => {
  expect($step.title).toBe('');
  expect($step.docStringType).toBeUndefined();
  expect($step.docString).toBeUndefined();
  expect($step.dataTable).toBeUndefined();
  expect($step.error).toBeUndefined();
  expect(() => $step.info).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.attach('outside')).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.skip()).toThrow('available only in BDD steps and step hooks');
});

function checkDocStringAndDataTable(step: BddTestFixtures['$step']) {
  if (step.title === 'a step with a doc string') {
    expect(step.docString).toBe('{ "value": 42 }');
    expect(step.dataTable).toBeUndefined();
  } else if (step.title === 'an empty doc string') {
    expect(step.docString).toBe('');
    expect(step.dataTable).toBeUndefined();
  } else if (step.title.includes('data table')) {
    expect(step.docString).toBeUndefined();
    expect(step.dataTable?.hashes()).toEqual([{ value: '42' }]);
  } else {
    expect(step.docString).toBeUndefined();
    expect(step.dataTable).toBeUndefined();
  }
}
