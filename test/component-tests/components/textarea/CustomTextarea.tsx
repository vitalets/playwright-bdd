import { BaseTextarea } from './BaseTextarea';

type Props = React.HTMLProps<HTMLTextAreaElement> & { 'data-testid'?: string };

export function CustomTextarea(props: Props) {
  return <BaseTextarea {...props} style={{ color: 'blue' }} />;
}
