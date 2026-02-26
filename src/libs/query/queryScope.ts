export const ANONYMOUS_QUERY_SCOPE = 'anonymous' as const;

export type QueryScope = `user:${string}` | typeof ANONYMOUS_QUERY_SCOPE;

export function createQueryScope(userId: string | null | undefined): QueryScope {
  if (!userId) {
    return ANONYMOUS_QUERY_SCOPE;
  }

  return `user:${userId}`;
}

export type ScopedQueryKey<T extends readonly unknown[]> = readonly [
  ...T,
  QueryScope,
];

export function withQueryScope<T extends readonly unknown[]>(
  key: T,
  scope?: QueryScope,
) {
  return (scope ? [...key, scope] : key) as T | ScopedQueryKey<T>;
}
