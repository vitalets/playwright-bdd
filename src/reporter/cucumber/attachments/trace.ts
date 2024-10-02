/**
 * Copy trace viewer to the report folder.
 * See: https://github.com/microsoft/playwright/blob/412073253f03099d0fe4081b26ad5f0494fea8d2/packages/playwright/src/reporters/html.ts#L317
 */

import path from 'node:path';
import fs from 'node:fs';
import * as messages from '@cucumber/messages';
import { copyFileAndMakeWritable } from '../../../utils/paths';

// eslint-disable-next-line visual/complexity
export async function copyTraceViewer(reportDir: string) {
  const traceViewerFolder = path.join(
    require.resolve('playwright-core'),
    '..',
    'lib',
    'vite',
    'traceViewer',
  );
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
