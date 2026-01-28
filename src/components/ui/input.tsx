import { inputWrapper, inputField, caption } from './input.css';

interface InputProps {
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  caption?: string;
  disabled?: boolean;
}

export const Input = ({
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  caption: captionText,
  disabled = false,
}: InputProps) => {
  return (
    <div className={inputWrapper}>
      <input
        className={inputField}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      />
      <div className={caption}>{captionText || ''}</div>
    </div>
  );
};

export default Input;
