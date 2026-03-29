/**
 * Builds Pickle messages.
 */
import * as messages from '@cucumber/messages';
import { AutofillMap } from '../../../utils/AutofillMap';
import { TestCase } from './TestCase';
import { ConcreteEnvelope } from './types';
import { getFeatureUriWithProject } from './Projects';

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
      ...testCase.pickle,
      uri: getFeatureUriWithProject(testCase.projectInfo, testCase.pickle.uri),
    };
    return { pickle };
  }
}
