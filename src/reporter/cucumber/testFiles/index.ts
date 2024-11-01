import { AutofillMap } from '../../../utils/AutofillMap';
import { TestFileExtractor } from './extractor';

export class TestFiles {
  private files = new AutofillMap<string /* file path */, TestFileExtractor>();
  private loadingPromises: Promise<void>[] = [];

  registerTestFile(filePath: string) {
    return this.files.getOrCreate(filePath, () => {
      const testFileExtractor = new TestFileExtractor(filePath);
      this.files.set(filePath, testFileExtractor);
      this.loadingPromises.push(testFileExtractor.load());
      return testFileExtractor;
    });
  }

  waitAllLoaded() {
    return Promise.all(this.loadingPromises);
  }
}
