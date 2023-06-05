/**
 * Generate playwright test files from Gherkin documents.
 */
import fs from 'node:fs';
import path from 'node:path';
import { GherkinDocument, Pickle } from '@cucumber/messages';
import { TestFile } from './testFile';
import { loadConfig } from '../cucumber/loadConfig';
import { loadFeatures } from '../cucumber/loadFeatures';
import { loadSteps } from '../cucumber/loadSteps';
import { ISupportCodeLibrary } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { BDDInputConfig, getConfig, extractCucumberConfig, BDDConfig } from '../config';
import { log } from '../utils';

export async function generateBDDFilesImpl(inputConfig?: BDDInputConfig) {
  const config = getConfig(inputConfig);
  const { runConfiguration } = await loadConfig({ provided: extractCucumberConfig(config) });
  const [features, supportCodeLibrary] = await Promise.all([
    loadFeatures(runConfiguration),
    loadSteps(runConfiguration),
  ]);
  const files = buildFiles(features, supportCodeLibrary, config);
  const paths = saveFiles(files, config);
  if (config.verbose) log(`Generated files: ${paths.length}`);
  return paths;
}

function buildFiles(
  features: Map<GherkinDocument, Pickle[]>,
  supportCodeLibrary: ISupportCodeLibrary,
  { outputDir, importTestFrom }: BDDConfig,
) {
  const files: TestFile[] = [];
  features.forEach((pickles, doc) => {
    const file = new TestFile({
      doc,
      pickles,
      supportCodeLibrary,
      outputDir,
      importTestFrom,
    }).build();
    files.push(file);
  });
  return files;
}

function saveFiles(files: TestFile[], { outputDir, verbose }: BDDConfig) {
  clearDir(outputDir);
  return files.map((file) => {
    file.save();
    if (verbose) log(`Generated: ${path.relative(process.cwd(), file.outputPath)}`);
    return file.outputPath;
  });
}

function clearDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
}
