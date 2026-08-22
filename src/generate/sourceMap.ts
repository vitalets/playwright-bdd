/**
 * Generates an inline Source Map v3 from a generated Playwright test to its feature file.
 *
 * FeatureToTestMapper first discovers final generated locations using temporary formatter markers.
 * This module combines those locations with the corresponding Gherkin locations and serializes the
 * result as a data URL embedded in the generated test. See featureToTestMapper.ts for a complete
 * marker example.
 */
import path from 'node:path';
import { Location } from '@cucumber/messages';
import { SourceMapGenerator } from 'source-map';
import { BDDConfig } from '../config/types';
import { toPosixPath } from '../utils/paths';
import { FeatureToTestMapper, GeneratedLocation } from './featureToTestMapper';
import { TestGen } from './test';

type Mapping = {
  generated: GeneratedLocation;
  original: Location;
};

type TestFileSourceMapOptions = {
  config: BDDConfig;
  outputPath: string;
  featureUri: string;
  featureSource: string;
  tests: TestGen[];
  featureToTestMapper: FeatureToTestMapper;
};

export class TestFileSourceMap {
  readonly content: string;
  readonly url: string;

  constructor(private options: TestFileSourceMapOptions) {
    this.content = this.generate();
    const base64 = Buffer.from(this.content).toString('base64');
    this.url = `data:application/json;charset=utf-8;base64,${base64}`;
  }

  private generate() {
    const { config, outputPath, featureUri, featureSource, tests, featureToTestMapper } =
      this.options;
    const featurePath = path.resolve(config.configDir, featureUri);
    const sourcePath = toPosixPath(path.relative(path.dirname(outputPath), featurePath));
    const map = new SourceMapGenerator({ file: path.basename(outputPath) });
    map.setSourceContent(sourcePath, featureSource);

    this.collectMappings(tests, featureToTestMapper).forEach(({ generated, original }) => {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column,
        },
        source: sourcePath,
        original: {
          line: original.line,
          column: (original.column ?? 1) - 1,
        },
      });
    });

    return map.toString();
  }

  private collectMappings(tests: TestGen[], featureToTestMapper: FeatureToTestMapper) {
    const mappings = new Map<string, Mapping>();

    featureToTestMapper.getSuiteLocations().forEach((mapping) => {
      this.addMapping(mappings, mapping.generated, mapping.original);
    });

    tests.forEach((test) => {
      this.addMapping(
        mappings,
        featureToTestMapper.getPwTestLocation(test.pickle),
        test.pickle.location,
      );
      test.stepsData.forEach(({ pickleStep, gherkinStep }) => {
        this.addMapping(
          mappings,
          featureToTestMapper.getPwStepLocation(pickleStep),
          gherkinStep.location,
        );
      });
    });

    return [...mappings.values()].sort(
      (a, b) => a.generated.line - b.generated.line || a.generated.column - b.generated.column,
    );
  }

  private addMapping(
    mappings: Map<string, Mapping>,
    generated: GeneratedLocation,
    original: Location,
  ) {
    const key = `${generated.line}:${generated.column}`;
    const existing = mappings.get(key);
    if (
      existing &&
      (existing.original.line !== original.line || existing.original.column !== original.column)
    ) {
      throw new Error(`Conflicting source locations for generated position: ${key}`);
    }
    mappings.set(key, { generated, original });
  }
}
