/**
 * Builds 'object shape' - an object with all possible paths as keys.
 * Values by default is number of such paths in original object (or array of objects)
 * Values can also be ignored or contain array of all possible values,
 * depends on passed { ignorePaths, valuePaths }.
 */
import get from 'lodash.get';
import assert from 'node:assert/strict';

export function assertShape(actualJson, expectedJson, { ignorePaths, valuePaths, transform }) {
  const actualShape = buildShape(actualJson, { ignorePaths, valuePaths, transform });
  const expectedShape = buildShape(expectedJson, { ignorePaths, valuePaths });
  assert.deepEqual(actualShape, expectedShape);
}

export function buildShape(obj, { ignorePaths, valuePaths, transform } = {}) {
  const shape = {};
  const arr = Array.isArray(obj) ? obj : [obj];
  arr.forEach((obj) => {
    getAllPaths(obj).forEach((path) => {
      const pathStr = getPathStr(path);
      const isIgnorePath = hasPrefix(pathStr, ignorePaths);
      const isValuePath = hasPrefix(pathStr, valuePaths);
      if (isValuePath) {
        const rawVal = get(obj, path);
        const val = transform ? transform(pathStr, rawVal) : rawVal;
        shape[pathStr] = shape[pathStr] || {};
        shape[pathStr][val] = shape[pathStr][val] || 0;
        shape[pathStr][val]++;
      } else if (isIgnorePath) {
        return;
      } else {
        shape[pathStr] = shape[pathStr] || 0;
        shape[pathStr]++;
      }
    });
  });

  return shape;
}

/**
 * Stringifies object path, replaces index with #.
 * E.g. ['pickle', 'steps', '0', 'type'] -> 'pickle.steps.#.type'
 */
function getPathStr(path) {
  return path.map((v) => (/^\d+$/.test(v) ? '#' : v)).join('.');
}

/**
 * Returns all possible paths in object.
 * See: https://stackoverflow.com/questions/37759768/get-all-paths-in-json-object
 */
function getAllPaths(o) {
  if (!o || typeof o !== 'object') return [];

  const paths = [];
  const stack = [{ obj: o, path: [] }];

  while (stack.length > 0) {
    const { obj, path } = stack.pop();

    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        stack.push({ obj: obj[key], path: [...path, key] });
      }
    } else {
      paths.push(path);
    }
  }

  return paths;
}

function hasPrefix(str, arr) {
  return arr?.filter(Boolean).some((prefix) => prefix === '*' || str.startsWith(prefix));
}
