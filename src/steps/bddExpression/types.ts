import type { BddExpressionResult, InferBddArgs, InferBddParams } from 'bdd-expressions' with {
  'resolution-mode': 'import',
};
import { AnyFunction, StepPattern } from '../stepDefinition';
import { BddStepFixture } from '../../runtime/bddStepState';
import { DataTable } from '../../cucumber/DataTable';

/**
 * Infer positional and named parameters and DocString and DataTable values only
 * when BDD expressions are enabled (`true`) and the step pattern is a string.
 * Disabled expressions, a non-literal `boolean`,
 * and RegExp patterns keep the original callback type without running the
 * potentially expensive type-level expression parser (InferBddParams).
 * The tuple check prevents distributing over `boolean` (`true | false`), so an
 * option whose value is unknown at compile time does not enable inference.
 */
export type BddExpressionStepFn<
  Fn extends AnyFunction,
  Pattern extends StepPattern,
  BddExpr extends boolean,
  Style extends 'playwright' | 'cucumber',
> = [BddExpr] extends [true]
  ? Pattern extends string
    ? Style extends 'playwright'
      ? (
          this: ThisParameterType<Fn>,
          fixtures: WithExpressionStep<Parameters<Fn>[0], Pattern>,
          ...args: BddExpressionArgs<Pattern>
        ) => ReturnType<Fn>
      : (
          this: WithExpressionStep<ThisParameterType<Fn>, Pattern>,
          ...args: BddExpressionArgs<Pattern>
        ) => ReturnType<Fn>
    : Fn
  : Fn;

// Validate expression slots while leaving trailing arguments to the existing
// arity checker: steps can receive an implicit DocString or DataTable argument.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type BddExpressionArgs<Pattern extends string> = [
  ...PermissiveArgs<InferBddArgs<Pattern, { DataTable: DataTable }>>,
  ...any[],
];

type ExpressionStepFields<Pattern extends string> = Pick<
  BddExpressionResult<InferBddParams<Pattern, { DataTable: DataTable }>, DataTable, Pattern>,
  'params' | 'docString' | 'dataTable'
>;

type WithExpressionStep<Value, Pattern extends string> = Value extends { $step: BddStepFixture }
  ? Omit<Value, '$step'> & {
      $step: Omit<Value['$step'], keyof ExpressionStepFields<Pattern>> &
        ExpressionStepFields<Pattern>;
    }
  : Value;

// Custom parameter transformers are registered at runtime, so their unknown
// result types must not reject explicitly typed callback or method parameters.
type PermissiveArgs<Args extends unknown[]> = {
  [Key in keyof Args]: unknown extends Args[Key] ? any : Args[Key];
};
