import type { InferBddArgs } from 'bdd-expressions' with { 'resolution-mode': 'import' };
import { DataTable } from '../../cucumber/DataTable';
import { AnyFunction, StepPattern } from '../stepDefinition';

// Validate expression slots while leaving trailing arguments to the existing
// arity checker: steps can receive an implicit DocString or DataTable argument.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type DecoratorStepFn<Pattern extends StepPattern, BddExpr extends boolean> = [
  BddExpr,
] extends [true]
  ? Pattern extends string
    ? (
        ...args: [...PermissiveArgs<InferBddArgs<Pattern, { DataTable: DataTable }>>, ...any[]]
      ) => unknown
    : AnyFunction
  : AnyFunction;

// Custom parameter transformers are registered at runtime, so their unknown
// result types must not reject explicitly typed method parameters.
type PermissiveArgs<Args extends unknown[]> = {
  [Key in keyof Args]: unknown extends Args[Key] ? any : Args[Key];
};
