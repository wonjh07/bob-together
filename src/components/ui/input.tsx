import { inputWrapper, inputField, caption } from './input.css';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  caption?: string;
}

export const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  caption: captionText,
}: InputProps) => {
  return (
    <div className={inputWrapper}>
      <input
        className={inputField}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      <div className={caption}>{captionText || ''}</div>
    </div>
  );
};

export default Input;
