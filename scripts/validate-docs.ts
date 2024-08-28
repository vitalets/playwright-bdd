/**
 * Script to validate relative links in docs.
 * Usage:
 * npx ts-node scripts/validate-docs.ts
 */

import fs from 'node:fs';
import fg from 'fast-glob';
import path from 'node:path';
import { marked, Tokens } from 'marked';
import slugify from 'slugify';

// without this '$' is translated to 'dollar'
slugify.extend({ $: '' });

const logger = console;

type FileInfo = {
  path: string;
  content: string;
  anchors: string[];
  links: Tokens.Link[];
};

const DOCS_DIR = 'docs';
const IGNORE_LINKS = ['docs/changelog', 'docs/license'];

const files = fg.sync('**', { cwd: DOCS_DIR, onlyFiles: true }).map(fillFileInfo);
const errors = files.map(validateFile).flat().filter(Boolean);

logger.log(`Validating docs: ${files.length} files...`);
errors.forEach((error) => logger.log(error));
logger.log(`Invalid links: ${errors.length}`);
if (errors.length) process.exitCode = 1;

function fillFileInfo(relPath: string) {
  const fileInfo: FileInfo = {
    path: path.join(DOCS_DIR, relPath),
    content: '',
    anchors: [],
    links: [],
  };
  if (relPath.endsWith('.md')) {
    fileInfo.content = fs.readFileSync(fileInfo.path, 'utf8');
    marked.parse(fileInfo.content, {
      walkTokens: (token) => {
        if (token.type === 'heading') {
          const anchor = slugify(token.text, {
            lower: true,
            strict: true,
          });
          fileInfo.anchors.push(anchor);
        }
        if (token.type === 'link' && !/^https?:\/\//.test(token.href)) {
          fileInfo.links.push(token as Tokens.Link);
        }
      },
    });
  }
  return fileInfo;
}

function validateFile(fileInfo: FileInfo, index: number, files: FileInfo[]) {
  return fileInfo.links.map((token) => validateLink(fileInfo, token, files));
}

function validateLink(fileInfo: FileInfo, token: Tokens.Link, files: FileInfo[]) {
  const { pathname, hash } = parseTokenHref(token.href);
  if (pathname.startsWith('..')) {
    return formatError('Links with ".." are not supported', fileInfo, token.raw);
  }
  const targetPath = resolvePathname(fileInfo, pathname);
  if (IGNORE_LINKS.includes(targetPath)) return;
  const targetFileInfo = files.find((fileInfo) => fileInfo.path === targetPath);
  if (!targetFileInfo) {
    return formatError('Invalid path', fileInfo, token.raw);
  }
  if (hash && !targetFileInfo.anchors.includes(hash)) {
    return formatError('Invalid anchor', fileInfo, token.raw);
  }
}

function parseTokenHref(tokenHref: string) {
  // handling case [xxx](file.json ':include')
  const [pathname, hash] = tokenHref.split(' ')[0].split('#');
  return { pathname, hash };
}

function resolvePathname(fileInfo: FileInfo, pathname: string) {
  if (!pathname) return fileInfo.path;
  if (pathname.startsWith('.')) {
    const absPath = path.resolve(path.dirname(fileInfo.path), pathname);
    return path.relative(process.cwd(), absPath);
  } else {
    return path.join(DOCS_DIR, pathname);
  }
}

function getLocation(fileContent: string, text: string) {
  const index = fileContent.indexOf(text);
  const lines = fileContent.substring(0, index).split('\n');
  const line = lines.length;
  const column = lines[line - 1].length + 1;
  return { line, column };
}

function formatError(message: string, fileInfo: FileInfo, text: string) {
  const { line, column } = getLocation(fileInfo.content, text);
  return `[${message}]: ${fileInfo.path}:${line}:${column} ${text}`;
}
