import { BddExpressionArgs } from '../bddExpression/types';
import { AnyFunction, StepPattern } from '../stepDefinition';

export type CreateBddDecoratorsOptions<BddExpr extends boolean = boolean> = {
  tags?: string;
  bddExpr?: BddExpr;
};

export type DecoratorStepFn<Pattern extends StepPattern, BddExpr extends boolean> = [
  BddExpr,
] extends [true]
  ? Pattern extends string
    ? (...args: BddExpressionArgs<Pattern>) => unknown
    : AnyFunction
  : AnyFunction;
