/**
 * Copy trace viewer to the report folder.
 */

import path from 'node:path';
import fs from 'node:fs';
import * as messages from '@cucumber/messages';
import { copyFileAndMakeWritable } from '../../../utils/paths';

function getTraceViewerFolder() {
  const pwCorePath = require.resolve('playwright-core');
  // See: https://github.com/microsoft/playwright/blob/94321fef1c94f9851b6fcc4304d3844760e986cb/packages/playwright/src/reporters/html.ts#L314
  return path.join(pwCorePath, '..', 'lib', 'vite', 'traceViewer');
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
  // In PW trace url is generated dynamically in JS with location.href:
  // https://github.com/microsoft/playwright/blob/8f3353865d8d98e9b40c15497e60d5e2583410b6/packages/html-reporter/src/links.tsx#L102
  return `trace/index.html?trace=${attachment.url}`;
}
