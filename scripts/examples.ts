/**
 * Build and run examples
 * npm run examples
 * npm run examples -- playwright-style
 * npm run examples -- cucumber-style
 */

/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import pkg from '../package.json';

const generatedTar = `playwright-bdd-${pkg.version}.tgz`;
const targetTar = path.join('examples', 'playwright-bdd.tgz');
const dir = process.argv[2];
const dirs = dir ? [dir] : ['playwright-style', 'cucumber-style'];

buildExamples();
dirs.forEach(runExample);

function buildExamples() {
  execSync('npm run build', { stdio: 'inherit' });
  execSync('npm pack', { stdio: 'inherit' });
  if (getFileHash(generatedTar) === getFileHash(targetTar)) {
    console.log(`Files hash equal, skip npm install`);
    fs.rmSync(generatedTar);
    return;
  }
  fs.renameSync(generatedTar, targetTar);
  execSync(`npm install playwright-bdd.tgz`, { cwd: 'examples', stdio: 'inherit' });
}

function runExample(dir: string) {
  const cwd = path.join('examples', dir);
  console.log(cwd);
  execSync(`npm test`, { cwd, stdio: 'inherit' });
}

function getFileHash(filePath: string) {
  if (!fs.existsSync(filePath)) return '';
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}
