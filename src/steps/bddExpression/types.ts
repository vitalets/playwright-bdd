import type { InferBddParams } from 'bdd-expressions' with { 'resolution-mode': 'import' };
import { AnyFunction, StepPattern } from '../stepDefinition';
import { BddStepFixture } from '../../runtime/bddStepState';

/**
 * Infer named parameters only when BDD expressions are explicitly enabled (`true`)
 * and the step pattern is a string. Disabled expressions, a non-literal `boolean`,
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
          fixtures: WithParams<Parameters<Fn>[0], Pattern>,
          ...args: Tail<Parameters<Fn>>
        ) => ReturnType<Fn>
      : (
          this: WithParams<ThisParameterType<Fn>, Pattern>,
          ...args: Parameters<Fn>
        ) => ReturnType<Fn>
    : Fn
  : Fn;

type WithParams<Value, Pattern extends string> = Value extends { $step: BddStepFixture }
  ? Omit<Value, '$step'> & {
      $step: Omit<Value['$step'], 'params'> & { readonly params: InferBddParams<Pattern> };
    }
  : Value;

type Tail<Args extends unknown[]> = Args extends [unknown, ...infer Rest] ? Rest : Args;
