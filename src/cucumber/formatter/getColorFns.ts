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
    const chalkInstance = new chalk.Instance(support);
    return {
      forStatus(status: TestStepResultStatus) {
        return {
          AMBIGUOUS: chalkInstance.red.bind(chalk),
          FAILED: chalkInstance.red.bind(chalk),
          PASSED: chalkInstance.green.bind(chalk),
          PENDING: chalkInstance.yellow.bind(chalk),
          SKIPPED: chalkInstance.cyan.bind(chalk),
          UNDEFINED: chalkInstance.yellow.bind(chalk),
          UNKNOWN: chalkInstance.yellow.bind(chalk),
        }[status];
      },
      location: chalkInstance.gray.bind(chalk),
      tag: chalkInstance.cyan.bind(chalk),
      diffAdded: chalkInstance.green.bind(chalk),
      diffRemoved: chalkInstance.red.bind(chalk),
      errorMessage: chalkInstance.red.bind(chalk),
      errorStack: chalkInstance.grey.bind(chalk),
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
