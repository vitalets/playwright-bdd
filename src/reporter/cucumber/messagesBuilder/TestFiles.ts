/**
 * Class to load and manage list of test files.
 * todo: make files reading async?
 */
import fs from 'node:fs';
import { AutofillMap } from '../../../utils/AutofillMap';
import { BddDataExtractor } from '../../../bddData/extractor';
import { BddTestData } from '../../../bddData/types';

type TestFileExtractedData = {
  featureUri: string;
  bddData: BddTestData[];
};

export class TestFiles {
  private filesData = new AutofillMap<string /* file path */, TestFileExtractedData>();

  getBddData(filePath: string) {
    return this.filesData.getOrCreate(filePath, () => {
      return this.extractBddData(filePath);
    });
  }

  private extractBddData(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');
    const bddDataExtractor = new BddDataExtractor(filePath, content);
    return {
      featureUri: bddDataExtractor.extractFeatureUri(),
      bddData: bddDataExtractor.extract(),
    };
  }
}
