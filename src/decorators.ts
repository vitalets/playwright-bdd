import { Fixture } from './steps/decorators/fixture';
import { createStepDecorator } from './steps/decorators/steps';

export { Fixture };
export const Given = createStepDecorator('Given');
export const When = createStepDecorator('When');
export const Then = createStepDecorator('Then');
export const Step = createStepDecorator('Unknown');
