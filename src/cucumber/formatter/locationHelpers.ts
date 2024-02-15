import path from 'node:path';
import { doesHaveValue } from '../valueChecker';

interface ILineAndUri {
  line: number;
  uri: string;
}

export function formatLocation(obj: ILineAndUri, cwd?: string): string {
  let uri = obj.uri;
  if (doesHaveValue(cwd)) {
    uri = path.relative(cwd, uri);
  }
  return `${uri}:${obj.line.toString()}`;
}
