import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { SnippetInterface } from '@cucumber/cucumber/lib/formatter/step_definition_snippet_builder/snippet_syntax';

const testDir = defineBddConfig({
  paths: ['*.feature'],
  require: ['steps.ts'],
  formatOptions: {
    snippetInterface: SnippetInterface.AsyncAwait,
  },
});

export default defineConfig({
  testDir,
  forbidOnly: Boolean(process.env.FORBID_ONLY),
});
