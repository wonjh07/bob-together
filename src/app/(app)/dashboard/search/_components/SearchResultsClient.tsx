'use client';

import { useState } from 'react';

import AppointmentSearchResults from './ui/AppointmentSearchResults';
import GroupSearchResults from './ui/GroupSearchResults';
import SearchInput from './ui/SearchInput';
import { SearchTypeToggle } from './ui/SearchTypeToggle';

export default function SearchResultsClient() {
  const [active, setActive] = useState<'group' | 'appointment'>('appointment');

  return (
    <>
      <SearchTypeToggle value={active} onChange={setActive} />
      <SearchInput />
      {active === 'appointment' ? (
        <AppointmentSearchResults />
      ) : (
        <GroupSearchResults />
      )}
    </>
  );
}
