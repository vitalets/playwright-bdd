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
import { getAttachmentBodyAsBuffer, isAttachmentEnvelope } from '../attachments/helpers';
import { shouldSkipAttachment, SkipAttachments } from '../attachments/skip';
import {
  isTextAttachment,
  toEmbeddedAttachment,
  toExternalAttachment,
} from '../attachments/external';
import {
  copyTraceViewer,
  createViewTraceLinkAttachment,
  generateTraceUrl,
  isTraceAttachment,
  assetsViewTraceLinks,
} from './traceViewer';
import { createPromptAttachmentWithButton, scriptCopyPrompt } from './promptAttachment';
import { isPromptAttachmentContentType } from '../../../ai/promptAttachment';
import { throwIf } from '../../../utils';

type HtmlReporterOptions = {
  outputFile?: string;
  skipAttachments?: SkipAttachments;
  externalAttachments?: boolean;
  attachmentsBaseURL?: string;
};

// Directory for attahcments, relative to reportDir.
// We store attachments in subdirectory to not accidentally
// bloat the working dir and make it easier to find report html file.
// 'data' name is also used in Playwright HTML reporter.
const ATTACHMENTS_DIR = 'data';

export default class HtmlReporter extends BaseReporter {
  protected htmlStream: CucumberHtmlStream;
  protected attachmentsDir = '';
  protected attachmentsBaseURL = '';
  protected hasTraces = false;
  protected transformStream: Transform;
  protected receivedTestRunFinished = false;

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
    if (isTraceAttachment(attachment)) {
      this.hasTraces = true;
      const { testCaseStartedId, testStepId } = attachment;
      const href = generateTraceUrl(attachment);
      const newEnvelope = createViewTraceLinkAttachment(testCaseStartedId, testStepId, href);
      this.writeEnvelope(newEnvelope);
    }
  }

  protected setupAttachmentsDir() {
    throwIf(
      !this.outputDir,
      'Unable to externalize attachments when reporter is not writing to a file',
    );
    this.attachmentsDir = path.join(this.outputDir, ATTACHMENTS_DIR);
    if (fs.existsSync(this.attachmentsDir)) fs.rmSync(this.attachmentsDir, { recursive: true });
    fs.mkdirSync(this.attachmentsDir, { recursive: true });
  }

  protected setupAttachmentsBaseURL() {
    this.attachmentsBaseURL = removeTrailingSlash(
      // don't prepend '/' to ATTACHMENTS_DIR
      // to make it work when reporter is opened from file:// protocol.
      this.userOptions.attachmentsBaseURL || ATTACHMENTS_DIR,
    );
  }

  private handlePromptAttachment({ attachment }: AttachmentEnvelope) {
    if (isPromptAttachmentContentType(attachment.mediaType)) {
      const { testCaseStartedId, testStepId } = attachment;
      const prompt = getAttachmentBodyAsBuffer(attachment).toString();
      const promptAttachmentWithButton = createPromptAttachmentWithButton(
        testCaseStartedId,
        testStepId,
        prompt,
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
        const newChunk = this.receivedTestRunFinished ? this.injectCustomAssets(chunk) : chunk;
        callback(null, newChunk);
      },
    });
  }

  private injectCustomAssets(chunk: Buffer) {
    const chunkStr = chunk.toString();
    if (chunkStr.includes('</body>')) {
      const customAssets = [
        cssHideLogForCustomHtml, // prettier-ignore
        assetsViewTraceLinks,
        scriptCopyPrompt,
      ].join('\n');
      return chunkStr.replace('</body>', `${customAssets}</body>`);
    } else {
      return chunk;
    }
  }
}

function removeTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

/**
 * Custom css - hide LOG for custom html.
 */
const cssHideLogForCustomHtml = `
<style>
pre:has([data-custom-html]) {
  padding-left: 0.75em !important;
}
pre:has([data-custom-html])::before {
  content: none !important;
}
</style>
`;
