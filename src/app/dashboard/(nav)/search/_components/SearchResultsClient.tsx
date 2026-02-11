'use client';

import { useState } from 'react';

import AppointmentSearchResults from './ui/AppointmentSearchResults';
import GroupSearchResults from './ui/GroupSearchResults';
import SearchInput from './ui/SearchInput';
import { SearchTypeToggle } from './ui/SearchTypeToggle';

export default function SearchResultsClient() {
  const [active, setActive] = useState<'group' | 'appointment'>('appointment');
  const [inputValue, setInputValue] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const handleSearchSubmit = () => {
    setSubmittedQuery(inputValue.trim());
  };

  return (
    <>
      <SearchTypeToggle value={active} onChange={setActive} />
      <SearchInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSearchSubmit}
      />
      {active === 'appointment' ? (
        <AppointmentSearchResults query={submittedQuery} />
      ) : (
        <GroupSearchResults query={submittedQuery} />
      )}
    </>
  );
}
