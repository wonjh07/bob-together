'use client';

import { useMemo, useState } from 'react';

import Moveback from '@/app/(onboarding)/components/moveback';

import { loginLayoutContainer } from './layout.css';
import LayoutContext from './provider/onboarding-provider';

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
