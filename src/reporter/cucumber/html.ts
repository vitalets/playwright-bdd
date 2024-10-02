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
import { isAttachmentEnvelope } from './attachments/helpers';
import { shouldSkipAttachment, SkipAttachments } from './attachments/skip';
import {
  isTextAttachment,
  toEmbeddedAttachment,
  toExternalAttachment,
} from './attachments/external';
import { copyTraceViewer, generateTraceUrl, isTraceAttachment } from './attachments/trace';

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
    if (this.hasTraces) await copyTraceViewer(this.outputDir);
    await super.finished();
  }

  protected handleAttachment(envelope: AttachmentEnvelope) {
    if (shouldSkipAttachment(envelope, this.userOptions.skipAttachments)) return;

    // For now don't externalize text attachments, b/c they are not visible in the report.
    // In the future maybe handle separately 'text/x.cucumber.log+plain', 'text/uri-list'.
    // See: https://github.com/cucumber/cucumber-js/issues/2430
    // See: https://github.com/cucumber/react-components/blob/main/src/components/gherkin/attachment/Attachment.tsx#L32

    const useExternalAttachment =
      this.userOptions.externalAttachments && !isTextAttachment(envelope.attachment);

    const newAttachment = useExternalAttachment
      ? toExternalAttachment(envelope.attachment, this.attachmentsDir, this.attachmentsBaseURL)
      : toEmbeddedAttachment(envelope.attachment);

    if (useExternalAttachment) this.handleTraceAttachment(newAttachment);

    this.writeEnvelope({
      ...envelope,
      attachment: newAttachment,
    });
  }

  protected writeEnvelope(envelope: messages.Envelope) {
    this.htmlStream.write(envelope);
  }

  /**
   * If there is trace attachment, copy trace-viewer to the report
   * and create additional attachment with trace view link.
   * - implementation in PW: https://github.com/microsoft/playwright/blob/412073253f03099d0fe4081b26ad5f0494fea8d2/packages/playwright/src/reporters/html.ts#L414
   * - attachmentsBaseURL should start with http(s) to be able to show traces.
   */
  protected handleTraceAttachment(attachment: messages.Attachment) {
    if (this.attachmentsBaseURL.startsWith('http') && isTraceAttachment(attachment)) {
      this.hasTraces = true;
      this.writeEnvelope({
        attachment: {
          ...attachment,
          contentEncoding: messages.AttachmentContentEncoding.IDENTITY,
          mediaType: 'text/uri-list',
          body: generateTraceUrl(attachment),
          url: undefined,
        },
      });
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
}

function removeTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}
