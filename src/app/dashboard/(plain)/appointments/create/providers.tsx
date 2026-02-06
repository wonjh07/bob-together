'use client';

import { createContext, useContext, useMemo } from 'react';

import type { GroupSummary } from '@/actions/group';

type CreateAppointmentContextValue = {
  groups: GroupSummary[];
  initialGroupId: string | null;
  isLoading: boolean;
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
  groups: GroupSummary[];
  initialGroupId: string | null;
  isLoading: boolean;
  children: React.ReactNode;
}

export function CreateAppointmentProvider({
  groups,
  initialGroupId,
  isLoading,
  children,
}: CreateAppointmentProviderProps) {
  const value = useMemo(
    () => ({ groups, initialGroupId, isLoading }),
    [groups, initialGroupId, isLoading],
  );

  return (
    <CreateAppointmentContext.Provider value={value}>
      {children}
    </CreateAppointmentContext.Provider>
  );
}
