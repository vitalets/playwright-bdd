import { expect } from '@playwright/test';
import { Before, After, BeforeStep, AfterStep } from './fixtures';

Before(({ $step }) => {
  expect($step.title).toBe('');
  expect($step.docStringType).toBeUndefined();
  expect($step.error).toBeUndefined();
  expect(() => $step.info).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.attach('outside')).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.skip()).toThrow('available only in BDD steps and step hooks');
});

BeforeStep({ name: 'inspect step fixture before body' }, ({ $step }) => {
  expect($step.error).toBeUndefined();
  expect($step.info).toBeDefined();
});

AfterStep({ name: 'inspect step fixture after body' }, ({ $step }) => {
  expect($step.info).toBeDefined();
  expect($step.error).toBeUndefined();
});

After(({ $step }) => {
  expect($step.title).toBe('');
  expect($step.docStringType).toBeUndefined();
  expect($step.error).toBeUndefined();
  expect(() => $step.info).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.attach('outside')).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.skip()).toThrow('available only in BDD steps and step hooks');
});
