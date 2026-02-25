import SearchIcon from '@/components/icons/SearchIcon';

import * as styles from './SearchInput.css';

interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  inputId?: string;
  inputAriaLabel?: string;
  submitAriaLabel?: string;
  disabled?: boolean;
  submitDisabled?: boolean;
}

export default function SearchInput({
  value,
  onValueChange,
  placeholder,
  inputId,
  inputAriaLabel = '검색어 입력',
  submitAriaLabel = '검색',
  disabled = false,
  submitDisabled = false,
}: SearchInputProps) {
  return (
    <div className={styles.root}>
      <input
        id={inputId}
        type="search"
        className={styles.input}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={inputAriaLabel}
        disabled={disabled}
      />
      <button
        type="submit"
        className={styles.submitButton}
        aria-label={submitAriaLabel}
        disabled={submitDisabled}>
        <SearchIcon size={20} />
      </button>
    </div>
  );
}
