/* eslint-disable @typescript-eslint/no-explicit-any */

// see: https://stackoverflow.com/questions/67605122/obtain-a-slice-of-a-typescript-parameters-tuple
export type ParametersExceptFirst<F> = F extends (arg0: any, ...rest: infer R) => any ? R : never;
