'use client';

import { createContext, useContext, useMemo, useState } from 'react';

import Moveback from '@/app/(onboarding)/components/moveback';

import { loginLayoutContainer } from './layout.css';

const LayoutContext = createContext<{
  showMoveback: boolean;
  setShowMoveback: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export function useOnboardingLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('LayoutContext not found');
  return ctx;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [showMoveback, setShowMoveback] = useState(false);

  const contextValue = useMemo(
    () => ({ showMoveback, setShowMoveback }),
    [showMoveback],
  );

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className={loginLayoutContainer}>
        {showMoveback && <Moveback />}
        {children}
      </div>
    </LayoutContext.Provider>
  );
}
