import SearchIcon from '@/components/icons/SearchIcon';

import * as styles from './SearchInput.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function SearchInput({
  value,
  onChange,
  onSubmit,
}: SearchInputProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className={styles.container}>
      <form className={styles.wrapper} onSubmit={handleSubmit}>
        <input
          type="search"
          className={styles.input}
          placeholder="제목"
          aria-label="검색어 입력"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="submit" className={styles.icon} aria-label="검색">
          <SearchIcon width="28" height="28" />
        </button>
      </form>
    </div>
  );
}
