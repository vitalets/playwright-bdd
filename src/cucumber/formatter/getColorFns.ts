import { Writable } from 'node:stream';
import chalk from 'chalk';
import { supportsColor } from 'supports-color';
import { TestStepResultStatus } from '@cucumber/messages';
import { doesNotHaveValue } from '../valueChecker';
import { WriteStream } from 'node:tty';

type SupportsColor = { level: chalk.Level } | false;

type IColorFn = (text: string) => string;

export interface IColorFns {
  forStatus: (status: TestStepResultStatus) => IColorFn;
  location: IColorFn;
  tag: IColorFn;
  diffAdded: IColorFn;
  diffRemoved: IColorFn;
  errorMessage: IColorFn;
  errorStack: IColorFn;
}

export default function getColorFns(
  stream: Writable,
  env: NodeJS.ProcessEnv,
  enabled?: boolean,
): IColorFns {
  const support = detectSupport(stream, env, enabled);
  if (support) {
    return {
      forStatus(status: TestStepResultStatus) {
        return {
          AMBIGUOUS: chalk.red.bind(chalk),
          FAILED: chalk.red.bind(chalk),
          PASSED: chalk.green.bind(chalk),
          PENDING: chalk.yellow.bind(chalk),
          SKIPPED: chalk.cyan.bind(chalk),
          UNDEFINED: chalk.yellow.bind(chalk),
          UNKNOWN: chalk.yellow.bind(chalk),
        }[status];
      },
      location: chalk.gray.bind(chalk),
      tag: chalk.cyan.bind(chalk),
      diffAdded: chalk.green.bind(chalk),
      diffRemoved: chalk.red.bind(chalk),
      errorMessage: chalk.red.bind(chalk),
      errorStack: chalk.grey.bind(chalk),
    };
  } else {
    return {
      forStatus(_status: TestStepResultStatus) {
        return (x) => x;
      },
      location: (x) => x,
      tag: (x) => x,
      diffAdded: (x) => x,
      diffRemoved: (x) => x,
      errorMessage: (x) => x,
      errorStack: (x) => x,
    };
  }
}

function detectSupport(stream: Writable, env: NodeJS.ProcessEnv, enabled?: boolean) {
  const support = supportsColor(stream as WriteStream) as SupportsColor;
  // if we find FORCE_COLOR, we can let the supports-color library handle that
  if ('FORCE_COLOR' in env || doesNotHaveValue(enabled)) {
    return support;
  }
  return enabled ? support || { level: 1 } : false;
}
