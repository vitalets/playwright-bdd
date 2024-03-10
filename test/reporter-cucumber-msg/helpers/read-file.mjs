import fs from 'node:fs';

/**
 * Reads messages from ndjson file and returns as array.
 */
export function getMessagesFromFile(file) {
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

export function getJsonFromFile(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
