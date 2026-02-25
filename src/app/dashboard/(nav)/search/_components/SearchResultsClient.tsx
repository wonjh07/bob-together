'use client';

import { useState, type FormEvent } from 'react';

import SearchInput from '@/components/ui/SearchInput';

import * as styles from './SearchResultsClient.css';
import AppointmentSearchResults from './ui/AppointmentSearchResults';
import GroupSearchResults from './ui/GroupSearchResults';
import { SearchTypeToggle } from './ui/SearchTypeToggle';

export default function SearchResultsClient() {
  const [active, setActive] = useState<'group' | 'appointment'>('appointment');
  const [inputValue, setInputValue] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(inputValue.trim());
  };

  return (
    <>
      <SearchTypeToggle value={active} onChange={setActive} />
      <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
        <SearchInput
          value={inputValue}
          onValueChange={setInputValue}
          placeholder="제목"
        />
      </form>
      {active === 'appointment' ? (
        <AppointmentSearchResults query={submittedQuery} />
      ) : (
        <GroupSearchResults query={submittedQuery} />
      )}
    </>
  );
}
