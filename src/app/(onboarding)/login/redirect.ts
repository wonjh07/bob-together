const FALLBACK_REDIRECT_PATH = '/dashboard';

export function resolveLoginRedirectPath(redirectPath: string | null): string {
  if (!redirectPath) {
    return FALLBACK_REDIRECT_PATH;
  }

  if (!redirectPath.startsWith('/')) {
    return FALLBACK_REDIRECT_PATH;
  }

  if (redirectPath.startsWith('//')) {
    return FALLBACK_REDIRECT_PATH;
  }

  return redirectPath;
}
