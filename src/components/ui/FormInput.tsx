import { forwardRef } from 'react';

import {
  inputWrapper,
  inputField,
  inputFieldError,
  caption,
  successCaption,
} from './FormInput.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  successMessage?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, successMessage, ...props }, ref) => {
    return (
      <div className={inputWrapper}>
        <input
          className={error ? inputFieldError : inputField}
          ref={ref}
          {...props}
        />
        {error && <div className={caption}>{error}</div>}
        {!error && successMessage && (
          <div className={successCaption}>{successMessage}</div>
        )}
        {!error && !successMessage && <div style={{ minHeight: '20px' }} />}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
