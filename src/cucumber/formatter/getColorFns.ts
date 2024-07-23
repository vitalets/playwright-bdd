import { Writable } from 'node:stream';
import { TestStepResultStatus } from '@cucumber/messages';

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
  _stream: Writable,
  _env: NodeJS.ProcessEnv,
  _enabled?: boolean,
): IColorFns {
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
