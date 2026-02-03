import { formError } from './FormError.css';

type FormErrorProps = {
  message?: string;
};

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return <div className={formError}>{message}</div>;
}
