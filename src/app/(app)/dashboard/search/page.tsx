import SearchResultsClient from './_components/SearchResultsClient';
import { page } from './page.css';

export default function SearchPage() {
  return (
    <div className={page}>
      <SearchResultsClient />
    </div>
  );
}
