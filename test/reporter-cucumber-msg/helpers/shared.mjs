import get from 'lodash.get';

// todo: create a separate module? json-shape

/**
 * Builds 'object shape' - an object with all paths of objects in all messages.
 * Used for validating reports.
 */
export function buildArrayShape(objects, { ignorePaths, valuePaths }) {
  const shape = {};
  objects.forEach((obj) => {
    getAllPaths(obj).forEach((path) => {
      const pathStr = getPathStr(path);
      const isIgnorePath = hasPrefix(pathStr, ignorePaths);
      const isValuePath = hasPrefix(pathStr, valuePaths);
      const curVal = shape[pathStr];
      if (isIgnorePath) return;
      if (isValuePath) {
        const newVal = get(obj, path);
        shape[pathStr] = curVal ? curVal.concat([newVal]).sort() : [newVal];
      } else {
        shape[pathStr] = curVal ? curVal + 1 : 1;
      }
    });
  });

  return shape;
}

export function buildObjectShape(obj, { ignorePaths, valuePaths }) {
  const shape = {};
  getAllPaths(obj).forEach((path) => {
    const pathStr = getPathStr(path);
    const isIgnorePath = hasPrefix(pathStr, ignorePaths);
    const isValuePath = hasPrefix(pathStr, valuePaths);
    const curVal = shape[pathStr];
    if (isIgnorePath) return;
    if (isValuePath) {
      const newVal = get(obj, path);
      shape[pathStr] = curVal ? curVal.concat([newVal]).sort() : [newVal];
    } else {
      shape[pathStr] = curVal ? curVal + 1 : 1;
    }
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
  return arr?.filter(Boolean).some((prefix) => str.startsWith(prefix));
}
