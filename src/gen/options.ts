import path from 'node:path';
import { ImportTestFrom } from './formatter';

export type GenOptions = {
  /** Dir to save generated files */
  outputDir?: string;
  /** Path to file for importing test instance */
  importTestFrom?: string | ImportTestFrom;
  /** Path to cucumber config file */
  cucumberConfig?: string;
};

export type ResolvedOptions = ReturnType<typeof getOptions>;

export const defaults = {
  outputDir: '.features-gen',
  importTestFrom: 'playwright-bdd',
} satisfies Required<Pick<GenOptions, 'outputDir' | 'importTestFrom'>>;

export function getOptions(inputOptions?: GenOptions) {
  const options = Object.assign({}, defaults, inputOptions);
  return {
    ...options,
    importTestFrom: resolveImportTestFrom(options.importTestFrom),
  };
}

function resolveImportTestFrom(importTestFrom: string | ImportTestFrom): ImportTestFrom {
  if (importTestFrom === defaults.importTestFrom) {
    return {
      file: importTestFrom,
    };
  } else {
    const { file, varName } =
      typeof importTestFrom === 'string' ? ({ file: importTestFrom } as ImportTestFrom) : importTestFrom;
    return {
      file: path.resolve(file),
      varName,
    };
  }
}
