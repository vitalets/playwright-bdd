import { Fixture } from './stepDefinitions/decorators/poms';
import { createStepDecorator } from './stepDefinitions/decorators/steps';

export { Fixture };
export const Given = createStepDecorator('Given');
export const When = createStepDecorator('When');
export const Then = createStepDecorator('Then');
export const Step = createStepDecorator('Unknown');
