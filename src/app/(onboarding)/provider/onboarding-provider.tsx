'use client';

import { createContext, useContext } from 'react';

const LayoutContext = createContext<{
  showMoveback: boolean;
  setShowMoveback: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export function useOnboardingLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('LayoutContext not found');
  return ctx;
}

export default LayoutContext;
