/**
 * Concatenate all docs into single markdown file.
 * node ./scripts/concat-docs.mjs
 *
 * Why is it needed? :)
 */
import fs from 'fs';
import path from 'path';

// Usage example
const inputDirectory = './docs';
const outputFilePath = './docs.md';

const excludeFiles = ['_sidebar.md', 'whats-new-in-v8.md'];

// Ensure the output directory exists
// fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

// Concatenate the markdown files
concatenateMarkdownFiles(inputDirectory, outputFilePath);

/**
 * Recursively fetches all markdown file paths from a directory.
 * @param {string} dir - The directory to search.
 * @param {string[]} fileList - Accumulated list of file paths (used for recursion).
 * @returns {string[]} Array of markdown file paths.
 */
function getMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files
    .filter((file) => !excludeFiles.includes(file))
    .forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        getMarkdownFiles(filePath, fileList);
      } else if (filePath.endsWith('.md')) {
        fileList.push(filePath);
      }
    });

  return fileList;
}

/**
 * Concatenates all markdown files from a directory into a single file.
 * @param {string} inputDir - The input directory.
 * @param {string} outputFile - The output file path.
 */
function concatenateMarkdownFiles(inputDir, outputFile) {
  const markdownFiles = getMarkdownFiles(inputDir);

  const outputStream = fs.createWriteStream(outputFile);

  markdownFiles.forEach((filePath) => {
    const relativePath = path.relative(inputDir, filePath);
    outputStream.write(`<!-- File: ${relativePath} -->\n\n`);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    outputStream.write(fileContent);
    outputStream.write('\n\n'); // Add some spacing between files
  });

  outputStream.end();
  // eslint-disable-next-line no-console
  console.log(`Concatenated ${markdownFiles.length} files into ${outputFile}`);
}
