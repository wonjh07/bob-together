'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react';

import type { GroupSummary } from '@/actions/group';

interface GroupContextValue {
  groups: GroupSummary[];
  currentGroupId: string | null;
  setCurrentGroupId: (id: string | null) => void;
  currentGroupName: string;
}

const GroupContext = createContext<GroupContextValue | null>(null);

interface GroupProviderProps {
  children: ReactNode;
  initialGroups: GroupSummary[];
  initialGroupId: string | null;
}

export function GroupProvider({
  children,
  initialGroups,
  initialGroupId,
}: GroupProviderProps) {
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(
    initialGroupId ?? initialGroups[0]?.groupId ?? null,
  );

  const currentGroupName = useMemo(() => {
    if (!currentGroupId) {
      return initialGroups.length > 0 ? initialGroups[0].name : '그룹 선택';
    }
    const selected = initialGroups.find(
      (group) => group.groupId === currentGroupId,
    );
    return selected?.name || '그룹 선택';
  }, [initialGroups, currentGroupId]);

  const value = useMemo(
    () => ({
      groups: initialGroups,
      currentGroupId,
      setCurrentGroupId,
      currentGroupName,
    }),
    [initialGroups, currentGroupId, currentGroupName],
  );

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
