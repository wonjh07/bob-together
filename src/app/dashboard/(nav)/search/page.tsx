import SearchResultsClient from './_components/SearchResultsClient';
import * as styles from './page.css';

export default function SearchPage() {
  return (
    <div className={styles.page}>
      <SearchResultsClient />
    </div>
  );
}
