/**
 * Generate and show snippets for undefined steps
 */

import { IRunConfiguration, ISupportCodeLibrary } from '@cucumber/cucumber/api';
import { loadSnippetBuilder } from '../cucumber/loadSnippetBuilder';
import { TestFile, UndefinedStep } from '../gen/testFile';
import { exitWithMessage, log } from '../utils';
import StepDefinitionSnippetBuilder from '@cucumber/cucumber/lib/formatter/step_definition_snippet_builder';
import { CucumberStepFunction } from '../run/createBdd';

export async function showSnippetsAndExit(
  files: TestFile[],
  runConfiguration: IRunConfiguration,
  supportCodeLibrary: ISupportCodeLibrary,
) {
  let { snippetInterface, snippetSyntax } = runConfiguration.formats.options;

  if (!snippetSyntax && isPlaywrightStyle(supportCodeLibrary)) {
    snippetSyntax = isTypeScript(supportCodeLibrary)
      ? require.resolve('./snippetSyntaxTs.js')
      : require.resolve('./snippetSyntax.js');
  }

  const snippetBuilder = await loadSnippetBuilder(
    supportCodeLibrary,
    snippetInterface,
    snippetSyntax,
  );

  const snippets = getSnippets(snippetBuilder, files);

  log(snippets.concat(['']).join('\n\n'));

  exitWithMessage(
    `Missing step definitions (${snippets.length}).`,
    'Use snippets above to create them.',
    getWarnOnZeroScannedFiles(supportCodeLibrary),
  );
}

function getSnippets(snippetBuilder: StepDefinitionSnippetBuilder, files: TestFile[]) {
  let index = 0;
  const snippets: string[] = [];
  files.forEach((file) => {
    file.undefinedSteps.forEach((undefinedStep) => {
      const snippet = getSnippet(snippetBuilder, file, ++index, undefinedStep);
      snippets.push(snippet);
    });
  });

  return snippets;
}

// eslint-disable-next-line max-params
function getSnippet(
  snippetBuilder: StepDefinitionSnippetBuilder,
  file: TestFile,
  index: number,
  undefinedStep: UndefinedStep,
) {
  const snippet = snippetBuilder.build({
    keywordType: undefinedStep.keywordType,
    pickleStep: undefinedStep.pickleStep,
  });
  const { line, column } = undefinedStep.step.location;
  return [
    `${index}. Missing step definition for "${file.sourceFile}:${line}:${column}"`,
    snippet,
  ].join('\n\n');
}

function isTypeScript(supportCodeLibrary: ISupportCodeLibrary) {
  const { requirePaths, importPaths } = supportCodeLibrary.originalCoordinates;
  return requirePaths.some((p) => p.endsWith('.ts')) || importPaths.some((p) => p.endsWith('.ts'));
}

function isPlaywrightStyle(supportCodeLibrary: ISupportCodeLibrary) {
  return supportCodeLibrary.stepDefinitions.length > 0
    ? supportCodeLibrary.stepDefinitions.some((d) => (d.code as CucumberStepFunction).fn)
    : true;
}

function getWarnOnZeroScannedFiles(supportCodeLibrary: ISupportCodeLibrary) {
  const { requirePaths, importPaths } = supportCodeLibrary.originalCoordinates;
  const scannedFilesCount = requirePaths.length + importPaths.length;
  return scannedFilesCount === 0
    ? `\nNote that 0 step definition files found, check the config.`
    : '';
}
