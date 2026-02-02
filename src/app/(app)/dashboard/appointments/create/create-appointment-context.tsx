'use client';

import { createContext, useContext, useMemo, useState } from 'react';

import type { GroupSummary } from '@/actions/group';

type CreateAppointmentContextValue = {
  groups: GroupSummary[];
  currentGroupId: string | null;
  setCurrentGroupId: React.Dispatch<React.SetStateAction<string | null>>;
};

const CreateAppointmentContext =
  createContext<CreateAppointmentContextValue | null>(null);

export function useCreateAppointmentContext() {
  const ctx = useContext(CreateAppointmentContext);
  if (!ctx) {
    throw new Error('CreateAppointmentContext not found');
  }
  return ctx;
}

interface CreateAppointmentProviderProps {
  initialGroups: GroupSummary[];
  initialGroupId: string | null;
  children: React.ReactNode;
}

export function CreateAppointmentProvider({
  initialGroups,
  initialGroupId,
  children,
}: CreateAppointmentProviderProps) {
  const [groups] = useState<GroupSummary[]>(initialGroups);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(
    initialGroupId ?? initialGroups[0]?.groupId ?? null,
  );

  const value = useMemo(
    () => ({ groups, currentGroupId, setCurrentGroupId }),
    [groups, currentGroupId],
  );

  return (
    <CreateAppointmentContext.Provider value={value}>
      {children}
    </CreateAppointmentContext.Provider>
  );
}
