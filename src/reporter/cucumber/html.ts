/**
 * Cucumber html reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/html_formatter.ts
 * See: https://github.com/cucumber/html-formatter
 * See: https://github.com/cucumber/react-components
 */
import fs from 'node:fs';
import { finished } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';
import * as messages from '@cucumber/messages';
import { CucumberHtmlStream } from '@cucumber/html-formatter';
import { resolvePackageRoot } from '../../utils';
import path from 'node:path';
import mimeTypes from 'mime';
import BaseReporter, { InternalOptions, isAttachmentAllowed, SkipAttachments } from './base';
import { ConcreteEnvelope } from './messagesBuilder/types';

type HtmlReporterOptions = {
  outputFile?: string;
  skipAttachments?: SkipAttachments;
  externalAttachments?: boolean;
};

// store attachments in 'attachments' subdirectory to not accidentally
// bloat working dir and make it easier to find report html file.
const ATTACHMENTS_DIR = 'attachments';

const encodingsMap = {
  IDENTITY: 'utf-8',
  BASE64: 'base64',
} as const;

export default class HtmlReporter extends BaseReporter {
  protected htmlStream: CucumberHtmlStream;
  protected externalAttachmentsDir = '';
  protected externalAttachmentsPromises: Promise<void>[] = [];

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
    this.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      if (this.shouldSkipAttachment(envelope)) return;
      if (this.shouldExternalizeAttachment(envelope)) {
        envelope = this.externalizeAttachment(envelope);
      }
      this.htmlStream.write(envelope);
    });
    this.htmlStream.pipe(this.outputStream);
  }

  async finished() {
    this.htmlStream.end();
    await finished(this.htmlStream);
    await super.finished();
    await Promise.all(this.externalAttachmentsPromises);
  }

  private shouldSkipAttachment(envelope: messages.Envelope) {
    return !isAttachmentAllowed(envelope, this.userOptions.skipAttachments);
  }

  private shouldExternalizeAttachment(
    envelope: messages.Envelope,
  ): envelope is NonNullable<ConcreteEnvelope<'attachment'>> {
    if (!this.userOptions.externalAttachments) return false;
    if (!envelope.attachment) return false;

    // For now don't externalize text attachments, b/c they are not visible in the report.
    // In the future maybe handle separately 'text/x.cucumber.log+plain', 'text/uri-list'.
    // See: https://github.com/cucumber/cucumber-js/issues/2430
    // See: https://github.com/cucumber/react-components/blob/main/src/components/gherkin/attachment/Attachment.tsx#L32
    if (/^(text\/|application\/json)/.test(envelope.attachment.mediaType)) return false;

    return true;
  }

  private externalizeAttachment(
    envelope: NonNullable<ConcreteEnvelope<'attachment'>>,
  ): messages.Envelope {
    const { attachment } = envelope;
    const fileName = this.buildAttachmentFilename(attachment);
    const filePath = this.buildAttachmentPath(fileName);
    const content = Buffer.from(attachment.body, encodingsMap[attachment.contentEncoding]);
    const externalAttachment: messages.Attachment = {
      ...attachment,
      contentEncoding: messages.AttachmentContentEncoding.IDENTITY,
      body: '',
      url: `./${ATTACHMENTS_DIR}/${fileName}`,
    };

    const promise = fs.promises.writeFile(filePath, content);
    this.externalAttachmentsPromises.push(promise);

    return {
      ...envelope,
      attachment: externalAttachment,
    };
  }

  private buildAttachmentFilename(attachment: messages.Attachment) {
    return [randomUUID(), mimeTypes.getExtension(attachment.mediaType)].filter(Boolean).join('.');
  }

  private buildAttachmentPath(fileName: string) {
    if (!this.outputDir) {
      throw new Error('Unable to externalize attachments when formatter is not writing to a file');
    }
    if (!this.externalAttachmentsDir) {
      this.externalAttachmentsDir = path.join(this.outputDir, ATTACHMENTS_DIR);
      fs.mkdirSync(this.externalAttachmentsDir, { recursive: true });
    }
    return path.join(this.externalAttachmentsDir, fileName);
  }
}
