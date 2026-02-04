import SearchIcon from '@/components/icons/SearchIcon';

import * as styles from './SearchInput.css';

export default function SearchInput() {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <input
          type="search"
          className={styles.input}
          placeholder="마라탕"
          aria-label="검색어 입력"
        />
        <button className={styles.icon} aria-hidden="true">
          <SearchIcon width="28" height="28" />
        </button>
      </div>
    </div>
  );
}
