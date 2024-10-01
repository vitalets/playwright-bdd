/**
 * Cucumber html reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/html_formatter.ts
 * See: https://github.com/cucumber/html-formatter
 * See: https://github.com/cucumber/react-components
 */
import fs from 'node:fs';
import { finished } from 'node:stream/promises';
import * as messages from '@cucumber/messages';
import { CucumberHtmlStream } from '@cucumber/html-formatter';
import { resolvePackageRoot } from '../../utils';
import path from 'node:path';
import BaseReporter, { InternalOptions } from './base';
import { AttachmentEnvelope } from './messagesBuilder/types';
import { isAttachmentEnvelope } from './attachmentHelpers/shared';
import { shouldSkipAttachment, SkipAttachments } from './attachmentHelpers/skip';
import {
  isTextAttachment,
  toEmbeddedAttachment,
  toExternalAttachment,
} from './attachmentHelpers/external';

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

  constructor(
    internalOptions: InternalOptions,
    protected userOptions: HtmlReporterOptions = {},
  ) {
    super(internalOptions);
    this.setOutputStream(this.userOptions.outputFile);
    const packageRoot = resolvePackageRoot('@cucumber/html-formatter');
    this.htmlStream = new CucumberHtmlStream(
      path.join(packageRoot, 'dist/main.css'),
      path.join(packageRoot, 'dist/main.js'),
    );
    if (this.userOptions.externalAttachments) {
      this.setupAttachmentsDir();
      this.setupAttachmentsBaseURL();
    }
    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (isAttachmentEnvelope(envelope)) {
        this.handleAttachment(envelope);
      } else {
        this.writeEnvelope(envelope);
      }
    });
    this.htmlStream.pipe(this.outputStream);
  }

  async finished() {
    this.htmlStream.end();
    await finished(this.htmlStream);
    await super.finished();
  }

  protected handleAttachment(envelope: AttachmentEnvelope) {
    if (shouldSkipAttachment(envelope, this.userOptions.skipAttachments)) return;

    // For now don't externalize text attachments, b/c they are not visible in the report.
    // In the future maybe handle separately 'text/x.cucumber.log+plain', 'text/uri-list'.
    // See: https://github.com/cucumber/cucumber-js/issues/2430
    // See: https://github.com/cucumber/react-components/blob/main/src/components/gherkin/attachment/Attachment.tsx#L32

    envelope.attachment =
      this.userOptions.externalAttachments && !isTextAttachment(envelope.attachment)
        ? toExternalAttachment(envelope.attachment, this.attachmentsDir, this.attachmentsBaseURL)
        : toEmbeddedAttachment(envelope.attachment);

    this.writeEnvelope(envelope);
  }

  protected writeEnvelope(envelope: messages.Envelope) {
    this.htmlStream.write(envelope);
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
    this.attachmentsBaseURL = this.userOptions.attachmentsBaseURL || `./${ATTACHMENTS_DIR}`;
    this.attachmentsBaseURL = this.attachmentsBaseURL.replace(/\/+$/, '');
  }
}
