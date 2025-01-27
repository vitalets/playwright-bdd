/**
 * Cucumber html reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/html_formatter.ts
 * See: https://github.com/cucumber/html-formatter
 * See: https://github.com/cucumber/react-components
 */
import fs from 'node:fs';
import { finished } from 'node:stream/promises';
import { Transform } from 'node:stream';
import * as messages from '@cucumber/messages';
import { CucumberHtmlStream } from '@cucumber/html-formatter';
import path from 'node:path';
import BaseReporter, { InternalOptions } from '../base';
import { AttachmentEnvelope } from '../messagesBuilder/types';
import {
  createLinkAttachment,
  createLogAttachment,
  getAttachmentBodyAsBuffer,
  isAttachmentEnvelope,
} from '../attachments/helpers';
import { shouldSkipAttachment, SkipAttachments } from '../attachments/skip';
import {
  isTextAttachment,
  toEmbeddedAttachment,
  toExternalAttachment,
} from '../attachments/external';
import { copyTraceViewer, generateTraceUrl, isTraceAttachment } from './traceViewer';
import { fixWithAiCss, fixWithAiScript } from './promptAttachment/assets';
import { getPromptAttachmentButtonHtml } from './promptAttachment/button';
import { isPromptAttachmentContentType } from '../../../ai/promptAttachment';

type HtmlReporterOptions = {
  outputFile?: string;
  skipAttachments?: SkipAttachments;
  externalAttachments?: boolean;
  attachmentsBaseURL?: string;
};

// store attachments in subdirectory to not accidentally
// bloat working dir and make it easier to find report html file.
// 'data' name is also used in Playwright HTML reporter.
const ATTACHMENTS_DIR = 'data';

export default class HtmlReporter extends BaseReporter {
  protected htmlStream: CucumberHtmlStream;
  protected attachmentsDir = '';
  protected attachmentsBaseURL = '';
  protected hasTraces = false;
  protected transformStream: Transform;
  protected receivedTestRunFinished = false;
  protected hasPromptAttachments = false;

  constructor(
    internalOptions: InternalOptions,
    protected userOptions: HtmlReporterOptions = {},
  ) {
    super(internalOptions);
    this.setOutputStream(this.userOptions.outputFile);

    if (this.userOptions.externalAttachments) {
      this.setupAttachmentsDir();
      this.setupAttachmentsBaseURL();
    }

    this.htmlStream = new CucumberHtmlStream();
    this.transformStream = this.createTransformStream();

    this.htmlStream.pipe(this.transformStream).pipe(this.outputStream);

    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (envelope.testRunFinished) this.receivedTestRunFinished = true;
      if (isAttachmentEnvelope(envelope)) {
        this.handleAttachment(envelope);
      } else {
        this.writeEnvelope(envelope);
      }
    });
  }

  async finished() {
    this.htmlStream.end();
    await finished(this.htmlStream);
    await finished(this.transformStream);
    if (this.hasTraces) await copyTraceViewer(this.outputDir);
    await super.finished();
  }

  protected handleAttachment(envelope: AttachmentEnvelope) {
    if (shouldSkipAttachment(envelope, this.userOptions.skipAttachments)) return;

    // For now don't externalize text attachments, b/c they are not visible in the report.
    // In the future maybe handle separately 'text/x.cucumber.log+plain', 'text/uri-list'.
    // See: https://github.com/cucumber/cucumber-js/issues/2430
    // See: https://github.com/cucumber/react-components/blob/main/src/components/gherkin/attachment/Attachment.tsx#L32

    const isExternalAttachment =
      this.userOptions.externalAttachments && !isTextAttachment(envelope.attachment);

    const newAttachment = isExternalAttachment
      ? toExternalAttachment(envelope.attachment, this.attachmentsDir, this.attachmentsBaseURL)
      : toEmbeddedAttachment(envelope.attachment);

    if (isExternalAttachment) this.handleTraceAttachment(newAttachment);

    this.writeEnvelope({
      ...envelope,
      attachment: newAttachment,
    });

    this.handlePromptAttachment(envelope);
  }

  protected writeEnvelope(envelope: messages.Envelope) {
    this.htmlStream.write(envelope);
  }

  /**
   * If there is trace attachment, copy trace-viewer to the report
   * and create additional attachment with trace view link.
   * - implementation in PW: https://github.com/microsoft/playwright/blob/release-1.50/packages/playwright/src/reporters/html.ts#L434
   * - attachmentsBaseURL should start with http(s) to be able to show traces.
   */
  protected handleTraceAttachment(attachment: messages.Attachment) {
    if (this.attachmentsBaseURL.startsWith('http') && isTraceAttachment(attachment)) {
      this.hasTraces = true;
      const { testCaseStartedId, testStepId } = attachment;
      const href = generateTraceUrl(attachment);
      const newEnvelope = createLinkAttachment(testCaseStartedId, testStepId, href);
      this.writeEnvelope(newEnvelope);
    }
  }

  protected setupAttachmentsDir() {
    if (!this.outputDir) {
      throw new Error('Unable to externalize attachments when reporter is not writing to a file');
    }
    this.attachmentsDir = path.join(this.outputDir, ATTACHMENTS_DIR);
    if (fs.existsSync(this.attachmentsDir)) fs.rmSync(this.attachmentsDir, { recursive: true });
    fs.mkdirSync(this.attachmentsDir, { recursive: true });
  }

  protected setupAttachmentsBaseURL() {
    this.attachmentsBaseURL = removeTrailingSlash(
      this.userOptions.attachmentsBaseURL || ATTACHMENTS_DIR,
    );
  }

  private handlePromptAttachment({ attachment }: AttachmentEnvelope) {
    if (isPromptAttachmentContentType(attachment.mediaType)) {
      this.hasPromptAttachments = true;
      const { testCaseStartedId, testStepId } = attachment;
      const prompt = getAttachmentBodyAsBuffer(attachment).toString();
      const promptAttachmentWithButton = createLogAttachment(
        testCaseStartedId,
        testStepId,
        getPromptAttachmentButtonHtml(prompt),
      );
      this.writeEnvelope(promptAttachmentWithButton);
    }
  }

  /**
   * Special transform stream to inject custom script into the HTML.
   */
  private createTransformStream() {
    return new Transform({
      transform: (chunk, _encoding, callback) => {
        const shouldInjectCustomAssets = this.hasPromptAttachments && this.receivedTestRunFinished;
        const newChunk = shouldInjectCustomAssets ? this.injectCustomAssets(chunk) : chunk;
        callback(null, newChunk);
      },
    });
  }

  private injectCustomAssets(chunk: Buffer) {
    const chunkStr = chunk.toString();
    return chunkStr.includes('</body>')
      ? chunkStr.replace('</body>', `${fixWithAiCss}${fixWithAiScript}</body>`)
      : chunk;
  }
}

function removeTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}
