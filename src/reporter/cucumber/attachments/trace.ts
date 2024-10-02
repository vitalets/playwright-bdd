/**
 * Copy trace viewer to the report folder.
 */

import path from 'node:path';
import fs from 'node:fs';
import * as messages from '@cucumber/messages';
import { copyFileAndMakeWritable } from '../../../utils/paths';

function getTraceViewerFolder() {
  const pwCorePath = require.resolve('playwright-core');
  // See: https://github.com/microsoft/playwright/blob/release-1.37/packages/playwright-test/src/reporters/html.ts#L276
  const traceViewerFolderTill137 = path.join(pwCorePath, '..', 'lib', 'webpack', 'traceViewer');
  // See: https://github.com/microsoft/playwright/blob/release-1.38/packages/playwright/src/reporters/html.ts#L295
  const traceViewerFolderSince138 = path.join(pwCorePath, '..', 'lib', 'vite', 'traceViewer');
  return fs.existsSync(traceViewerFolderSince138)
    ? traceViewerFolderSince138
    : traceViewerFolderTill137;
}

// eslint-disable-next-line visual/complexity
export async function copyTraceViewer(reportDir: string) {
  const traceViewerFolder = getTraceViewerFolder();
  const traceViewerTargetFolder = path.join(reportDir, 'trace');
  const traceViewerAssetsTargetFolder = path.join(traceViewerTargetFolder, 'assets');
  fs.mkdirSync(traceViewerAssetsTargetFolder, { recursive: true });
  for (const file of fs.readdirSync(traceViewerFolder)) {
    if (file.endsWith('.map') || file.includes('watch') || file.includes('assets')) continue;
    await copyFileAndMakeWritable(
      path.join(traceViewerFolder, file),
      path.join(traceViewerTargetFolder, file),
    );
  }
  for (const file of fs.readdirSync(path.join(traceViewerFolder, 'assets'))) {
    if (file.endsWith('.map') || file.includes('xtermModule')) continue;
    await copyFileAndMakeWritable(
      path.join(traceViewerFolder, 'assets', file),
      path.join(traceViewerAssetsTargetFolder, file),
    );
  }
}

export function isTraceAttachment(attachment: messages.Attachment) {
  return attachment.fileName === 'trace';
}

export function generateTraceUrl(attachment: messages.Attachment) {
  return `trace/index.html?trace=${attachment.url}`;
}
