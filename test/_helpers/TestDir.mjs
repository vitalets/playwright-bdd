/**
 * Class to manage files inside current test dir.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';
import { expect } from '@playwright/test';

export class TestDir {
  constructor(importMeta) {
    this.importMeta = importMeta;
  }

  /**
   * Test name = test dir from 'test/<xxx>/test.mjs'
   */
  get name() {
    return this.importMeta.url.split('/').slice(-2)[0];
  }

  getAbsPath(relativePath) {
    return path.isAbsolute(relativePath)
      ? relativePath
      : fileURLToPath(new URL(relativePath, this.importMeta.url));
  }

  clearDir(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    if (fs.existsSync(absPath)) fs.rmSync(absPath, { recursive: true });
  }

  isFileExists(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    return fs.existsSync(absPath);
  }

  getFileContents(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    return fs.readFileSync(absPath, 'utf8');
  }

  getAllFiles(relativePath) {
    const absPath = this.getAbsPath(relativePath);
    return fg.sync(path.join(absPath, '**')).map((file) => path.relative(absPath, file));
  }

  expectFileContains(relativePath, substr) {
    const substrList = Array.isArray(substr) ? substr : [substr];
    const fileContents = this.getFileContents(relativePath);
    substrList.forEach((substr) => {
      expect(fileContents).toContain(substr);
    });
  }

  expectFileContainsCounts(relativePath, expectedCounts) {
    const fileContents = this.getFileContents(relativePath);
    const actualCounts = {};
    Object.keys(expectedCounts).forEach((key) => {
      actualCounts[key] = fileContents.split(key).length - 1;
    });
    expect(actualCounts).toEqual(expectedCounts);
  }

  expectFileNotContain(relativePath, substr) {
    const substrList = Array.isArray(substr) ? substr : [substr];
    const fileContents = this.getFileContents(relativePath);
    substrList.forEach((substr) => {
      expect(fileContents).not.toContain(substr);
    });
  }

  expectFileExists(relativePath) {
    assert.equal(this.isFileExists(relativePath), true, `Expected file to exist: ${relativePath}`);
  }

  expectFileNotEmpty(relativePath) {
    this.expectFileExists(relativePath);
    assert(
      this.getFileContents(relativePath).trim().length > 0,
      `Expected non-empty file: ${relativePath}`,
    );
  }

  expectFileNotExist(relativePath) {
    assert.equal(
      this.isFileExists(relativePath),
      false,
      `Expected file does not exist: ${relativePath}`,
    );
  }
}
