import { Fixture, createStepDecorator } from './stepDefinitions/createDecorators';

export { Fixture };
export const Given = createStepDecorator('Given');
export const When = createStepDecorator('When');
export const Then = createStepDecorator('Then');
export const Step = createStepDecorator('Unknown');
