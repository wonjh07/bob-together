interface ErrorLike {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
}

export function withDevErrorDetails(
  baseMessage: string,
  error?: ErrorLike | null,
): string {
  if (process.env.NODE_ENV !== 'development' || !error) {
    return baseMessage;
  }

  const details = [
    error.code ? `code=${error.code}` : null,
    error.message ? `message=${error.message}` : null,
    error.details ? `details=${error.details}` : null,
    error.hint ? `hint=${error.hint}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  if (!details) {
    return baseMessage;
  }

  return `${baseMessage} [${details}]`;
}
