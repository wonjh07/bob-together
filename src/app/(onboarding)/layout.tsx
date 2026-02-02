'use client';

import { useMemo, useState } from 'react';

import Moveback from '@/components/ui/moveback';
import LayoutContext from '@/provider/moveback-provider';

import { loginLayoutContainer } from './layout.css';

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
