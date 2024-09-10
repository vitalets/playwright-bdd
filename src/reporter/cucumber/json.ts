/**
 * Cucumber json reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/json_formatter.ts
 *
 * Although json reporter is marked as deprecated in CucumberJS docs
 * (see https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md#json),
 * this decision was rolled back:
 * (see https://github.com/cucumber/json-formatter/issues/34).
 *
 * See also: separate tool to convert cucumber messages to cucumber json:
 * https://github.com/vrymar/cucumber-json-report-formatter/tree/master
 */

/* eslint-disable max-lines, max-statements, max-nested-callbacks, visual/complexity */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as messages from '@cucumber/messages';
import BaseReporter, { InternalOptions, isAttachmentAllowed, SkipAttachments } from './base';
import * as GherkinDocumentParser from '../../cucumber/formatter/GherkinDocumentParser';
import * as PickleParser from '../../cucumber/formatter/PickleParser';
import { doesHaveValue, doesNotHaveValue } from '../../cucumber/valueChecker';
import { ITestCaseAttempt } from '../../cucumber/formatter/EventDataCollector';
import { parseStepArgument } from '../../cucumber/stepArguments';
import { durationToNanoseconds } from '../../cucumber/formatter/durationHelpers';
// import { formatLocation } from '../../cucumber/formatter/locationHelpers';
import { GherkinDocumentMessage } from './messagesBuilder/GherkinDocument';
import { getFeatureNameWithProject } from './messagesBuilder/Projects';

const {
  getGherkinExampleRuleMap,
  getGherkinScenarioLocationMap,
  getGherkinStepMap,
  getGherkinScenarioMap,
} = GherkinDocumentParser;

const { getScenarioDescription, getPickleStepMap, getStepKeyword } = PickleParser;

type JsonReporterOptions = {
  outputFile?: string;
  skipAttachments?: SkipAttachments;
  addProjectToFeatureName?: boolean;
  addMetadata?: 'object' | 'list';
};

interface IJsonFeature {
  description: string;
  elements: IJsonScenario[];
  id: string;
  keyword: string;
  line: number;
  name: string;
  tags: IJsonTag[];
  uri: string;
  // Custom metadata to have richer reports.
  // For example, see: https://github.com/WasiqB/multiple-cucumber-html-reporter/tree/main?tab=readme-ov-file#custommetadata
  metadata?: IJsonFeatureMetadata;
}

type IJsonFeatureMetadata = Record<string, string> | { name: string; value: string }[];

interface IJsonScenario {
  description: string;
  id: string;
  keyword: string;
  line: number;
  name: string;
  steps: IJsonStep[];
  tags: IJsonTag[];
  type: string;
}

interface IJsonStep {
  arguments?: any; // TODO
  embeddings?: any; // TODO
  hidden?: boolean;
  keyword?: string; // TODO, not optional
  line?: number;
  match?: any; // TODO
  name?: string;
  result?: any; // TODO
}

interface IJsonTag {
  name: string;
  // In Cucumber line is not optional but actually it can contain undefined.
  // It is b/c Cucumber is not in strict mode.
  line?: number;
}

interface IBuildJsonFeatureOptions {
  gherkinDocument: messages.GherkinDocument;
  elements: IJsonScenario[];
  // feature: messages.Feature;
  // uri: string;
}

interface IBuildJsonScenarioOptions {
  feature: messages.Feature;
  gherkinScenarioMap: Record<string, messages.Scenario>;
  gherkinExampleRuleMap: Record<string, messages.Rule>;
  gherkinScenarioLocationMap: Record<string, messages.Location>;
  pickle: messages.Pickle;
  steps: IJsonStep[];
}

interface IBuildJsonStepOptions {
  isBeforeHook: boolean;
  gherkinStepMap: Record<string, messages.Step>;
  pickleStepMap: Record<string, messages.PickleStep>;
  testStep: messages.TestStep;
  testStepAttachments: messages.Attachment[];
  testStepResult: messages.TestStepResult;
}

interface UriToTestCaseAttemptsMap {
  [uri: string]: ITestCaseAttempt[];
}

export default class JsonReporter extends BaseReporter {
  // for now omit adding step definitions to json report
  // private supportCodeLibrary: Pick<ISupportCodeLibrary, 'stepDefinitions'> = {
  //   stepDefinitions: [],
  // };

  constructor(
    internalOptions: InternalOptions,
    protected userOptions: JsonReporterOptions = {},
  ) {
    super(internalOptions);
    this.setOutputStream(this.userOptions.outputFile);
    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.onTestRunFinished();
      }
    });
  }

  convertNameToId(obj: { name: string }): string {
    return obj.name.replace(/ /g, '-').toLowerCase();
  }

  formatDataTable(dataTable: messages.PickleTable): any {
    return {
      rows: dataTable.rows.map((row) => ({
        cells: row.cells.map((x) => x.value),
      })),
    };
  }

  formatDocString(docString: messages.PickleDocString, gherkinStep: messages.Step): any {
    return {
      content: docString.content,
      line: gherkinStep.docString?.location.line,
    };
  }

  formatStepArgument(
    stepArgument: messages.PickleStepArgument | undefined,
    gherkinStep: messages.Step,
  ): any {
    if (doesNotHaveValue(stepArgument)) {
      return [];
    }
    return [
      parseStepArgument<any>(stepArgument, {
        dataTable: (dataTable) => this.formatDataTable(dataTable),
        docString: (docString) => this.formatDocString(docString, gherkinStep),
      }),
    ];
  }

  onTestRunFinished(): void {
    const groupedTestCaseAttempts: UriToTestCaseAttemptsMap = {};
    this.eventDataCollector.getTestCaseAttempts().forEach((testCaseAttempt: ITestCaseAttempt) => {
      if (!testCaseAttempt.willBeRetried) {
        const uri = testCaseAttempt.pickle.uri;
        if (doesNotHaveValue(groupedTestCaseAttempts[uri])) {
          groupedTestCaseAttempts[uri] = [];
        }
        groupedTestCaseAttempts[uri].push(testCaseAttempt);
      }
    });
    const features = Object.keys(groupedTestCaseAttempts).map((uri) => {
      const group = groupedTestCaseAttempts[uri];
      const { gherkinDocument } = group[0];
      const gherkinStepMap = getGherkinStepMap(gherkinDocument);
      const gherkinScenarioMap = getGherkinScenarioMap(gherkinDocument);
      const gherkinExampleRuleMap = getGherkinExampleRuleMap(gherkinDocument);
      const gherkinScenarioLocationMap = getGherkinScenarioLocationMap(gherkinDocument);
      const elements = group.map((testCaseAttempt: ITestCaseAttempt) => {
        const { pickle } = testCaseAttempt;
        const pickleStepMap = getPickleStepMap(pickle);
        let isBeforeHook = true;
        const steps = testCaseAttempt.testCase.testSteps.map((testStep) => {
          isBeforeHook = isBeforeHook && !doesHaveValue(testStep.pickleStepId);
          return this.getStepData({
            isBeforeHook,
            gherkinStepMap,
            pickleStepMap,
            testStep,
            testStepAttachments: testCaseAttempt.stepAttachments[testStep.id],
            testStepResult: testCaseAttempt.stepResults[testStep.id],
          });
        });
        return this.getScenarioData({
          feature: gherkinDocument.feature!,
          gherkinScenarioLocationMap,
          gherkinExampleRuleMap,
          gherkinScenarioMap,
          pickle,
          steps,
        });
      });
      return this.getFeatureData({
        gherkinDocument,
        elements,
      });
    });

    this.outputStream.write(JSON.stringify(features, null, 2));
  }

  getFeatureData({ gherkinDocument, elements }: IBuildJsonFeatureOptions): IJsonFeature {
    const meta = GherkinDocumentMessage.extractMeta(gherkinDocument);
    const feature = gherkinDocument.feature!;
    const featureNameWithProject = getFeatureNameWithProject(meta.projectName, feature.name);
    return {
      description: feature.description,
      elements,
      id: this.convertNameToId({ name: featureNameWithProject }),
      line: feature.location.line,
      keyword: feature.keyword,
      name: this.userOptions.addProjectToFeatureName ? featureNameWithProject : feature.name,
      tags: this.getFeatureTags(feature),
      uri: meta.originalUri,
      metadata: this.getFeatureMetadata(gherkinDocument),
    };
  }

  getFeatureMetadata(gherkinDocument: messages.GherkinDocument): IJsonFeatureMetadata | undefined {
    if (!this.userOptions.addMetadata) return;
    const meta = GherkinDocumentMessage.extractMeta(gherkinDocument);
    const metadata: Record<string, string> = {
      Project: meta.projectName || '',
      Browser: meta.browserName || '',
    };
    return this.userOptions.addMetadata === 'object'
      ? metadata
      : Object.keys(metadata).map((name) => ({ name, value: metadata[name] }));
  }

  getScenarioData({
    feature,
    gherkinScenarioLocationMap,
    gherkinExampleRuleMap,
    gherkinScenarioMap,
    pickle,
    steps,
  }: IBuildJsonScenarioOptions): IJsonScenario {
    const description = getScenarioDescription({
      pickle,
      gherkinScenarioMap,
    });
    return {
      description,
      id: this.formatScenarioId({ feature, pickle, gherkinExampleRuleMap }),
      keyword: gherkinScenarioMap[pickle.astNodeIds[0]].keyword,
      line: gherkinScenarioLocationMap[pickle.astNodeIds[pickle.astNodeIds.length - 1]].line,
      name: pickle.name,
      steps,
      tags: this.getScenarioTags({ feature, pickle, gherkinScenarioMap }),
      type: 'scenario',
    };
  }

  private formatScenarioId({
    feature,
    pickle,
    gherkinExampleRuleMap,
  }: {
    feature: messages.Feature;
    pickle: messages.Pickle;
    gherkinExampleRuleMap: Record<string, messages.Rule>;
  }): string {
    let parts: any[];
    const rule = gherkinExampleRuleMap[pickle.astNodeIds[0]];
    if (doesHaveValue(rule)) {
      parts = [feature, rule, pickle];
    } else {
      parts = [feature, pickle];
    }
    return parts.map((part) => this.convertNameToId(part)).join(';');
  }

  getStepData({
    isBeforeHook,
    gherkinStepMap,
    pickleStepMap,
    testStep,
    testStepAttachments,
    testStepResult,
  }: IBuildJsonStepOptions): IJsonStep {
    const data: IJsonStep = {};
    if (doesHaveValue(testStep.pickleStepId)) {
      const pickleStep = pickleStepMap[testStep.pickleStepId];
      data.arguments = this.formatStepArgument(
        pickleStep.argument,
        gherkinStepMap[pickleStep.astNodeIds[0]],
      );
      data.keyword = getStepKeyword({ pickleStep, gherkinStepMap });
      data.line = gherkinStepMap[pickleStep.astNodeIds[0]].location.line;
      data.name = pickleStep.text;
    } else {
      data.keyword = isBeforeHook ? 'Before' : 'After';
      data.hidden = true;
    }
    // for now omit adding step definitions to json report
    // if (doesHaveValue(testStep.stepDefinitionIds) && testStep.stepDefinitionIds.length === 1) {
    //   const stepDefinition = this.supportCodeLibrary.stepDefinitions.find(
    //     (s) => s.id === testStep.stepDefinitionIds?.[0],
    //   );
    //   if (doesHaveValue(stepDefinition)) {
    //     data.match = { location: formatLocation(stepDefinition) };
    //   }
    // }
    const { message, status } = testStepResult;
    data.result = {
      status: messages.TestStepResultStatus[status].toLowerCase(),
    };
    if (doesHaveValue(testStepResult.duration)) {
      data.result.duration = durationToNanoseconds(testStepResult.duration);
    }
    if (status === messages.TestStepResultStatus.FAILED && doesHaveValue(message)) {
      data.result.error_message = message;
    }
    const allowedAttachments = this.getAllowedAttachments(testStepAttachments);
    if (allowedAttachments && allowedAttachments.length > 0) {
      data.embeddings = allowedAttachments.map((attachment) => ({
        data:
          attachment.contentEncoding === messages.AttachmentContentEncoding.IDENTITY
            ? Buffer.from(attachment.body).toString('base64')
            : attachment.body,
        mime_type: attachment.mediaType,
      }));
    }
    return data;
  }

  getFeatureTags(feature: messages.Feature): IJsonTag[] {
    return feature.tags.map((tagData) => ({
      name: tagData.name,
      line: tagData.location.line,
    }));
  }

  getScenarioTags({
    feature,
    pickle,
    gherkinScenarioMap,
  }: {
    feature: messages.Feature;
    pickle: messages.Pickle;
    gherkinScenarioMap: Record<string, messages.Scenario>;
  }): IJsonTag[] {
    const scenario = gherkinScenarioMap[pickle.astNodeIds[0]];

    return pickle.tags.map(
      (tagData: messages.PickleTag): IJsonTag => this.getScenarioTag(tagData, feature, scenario),
    );
  }

  private getScenarioTag(
    tagData: messages.PickleTag,
    feature: messages.Feature,
    scenario: messages.Scenario,
  ): IJsonTag {
    const byAstNodeId = (tag: messages.Tag): boolean => tag.id === tagData.astNodeId;
    const flatten = (acc: messages.Tag[], val: readonly messages.Tag[]) => acc.concat(val);

    const tag =
      feature.tags.find(byAstNodeId) ||
      scenario.tags.find(byAstNodeId) ||
      scenario.examples
        .map((e) => e.tags)
        .reduce((acc: messages.Tag[], val) => flatten(acc, val), [])
        .find(byAstNodeId);

    return {
      name: tagData.name,
      line: tag?.location?.line,
    };
  }

  private getAllowedAttachments(testStepAttachments?: messages.Attachment[]) {
    return testStepAttachments?.filter((attachment) => {
      return isAttachmentAllowed({ attachment }, this.userOptions.skipAttachments);
    });
  }
}
