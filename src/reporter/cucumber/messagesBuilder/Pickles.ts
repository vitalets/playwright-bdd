/**
 * Builds Pickle messages.
 */
import * as messages from '@cucumber/messages';
import { omit } from '../../../utils';
import { AutofillMap } from '../../../utils/AutofillMap';
import { getFeatureUriWithProject } from './GherkinDocuments';
import { TestCase } from './TestCase';
import { ConcreteEnvelope } from './types';

export class Pickles {
  buildMessages(testCases: AutofillMap<string, TestCase>) {
    const messages: ConcreteEnvelope<'pickle'>[] = [];
    testCases.forEach((testCase) => {
      messages.push(this.buildPickleMessage(testCase));
    });
    return messages;
  }

  private buildPickleMessage(testCase: TestCase) {
    const pickle: messages.Pickle = {
      ...omit(testCase.pickle, 'location'),
      uri: getFeatureUriWithProject(testCase.projectInfo, testCase.pickle.uri),
    };
    return { pickle };
  }
}
