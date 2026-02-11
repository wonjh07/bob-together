'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import { setSelectedGroupCookie } from '@/libs/server/groupSelection';

interface GroupContextValue {
  currentGroupId: string | null;
  setCurrentGroupId: (id: string | null) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

interface GroupProviderProps {
  children: ReactNode;
  initialGroupId: string | null;
}

export function GroupProvider({ children, initialGroupId }: GroupProviderProps) {
  const [currentGroupId, setCurrentGroupIdState] = useState<string | null>(
    initialGroupId ?? null,
  );

  const setCurrentGroupId = (id: string | null) => {
    setCurrentGroupIdState(id);
    void setSelectedGroupCookie(id);
  };

  const value = { currentGroupId, setCurrentGroupId };

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
}

export function useGroupContext() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroupContext must be used within a GroupProvider');
  }
  return context;
}
