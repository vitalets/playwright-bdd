// Register all components used in tests.
// - import this file in fixtures.ts
// - import this file in tests to access components
export { CustomTextarea } from '../../components/textarea/CustomTextarea';

// Below will not work, because logo imports PNG image.
// This import is not cleared from steps.tsx and executted in Nodу contextб
// that not know what to do with PNG file.
// export { Logo } from '../../components/logo/Logo';
