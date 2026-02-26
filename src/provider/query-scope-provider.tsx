'use client';

import { createContext, useContext, type ReactNode } from 'react';

import {
  ANONYMOUS_QUERY_SCOPE,
  type QueryScope,
} from '@/libs/query/queryScope';

const QueryScopeContext = createContext<QueryScope>(ANONYMOUS_QUERY_SCOPE);

interface QueryScopeProviderProps {
  scope: QueryScope;
  children: ReactNode;
}

export function QueryScopeProvider({
  scope,
  children,
}: QueryScopeProviderProps) {
  return (
    <QueryScopeContext.Provider value={scope}>
      {children}
    </QueryScopeContext.Provider>
  );
}

export function useQueryScope() {
  return useContext(QueryScopeContext);
}
