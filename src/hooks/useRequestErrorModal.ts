'use client';

import { useCallback, useState } from 'react';

import { useRequestErrorContext } from '@/provider/request-error-provider';

export interface RequestErrorOpenOptions {
  title?: string;
  closeLabel?: string;
  err?: unknown;
  source?: string;
}

interface RequestErrorState {
  isOpen: boolean;
  message: string;
}

const INITIAL_STATE: RequestErrorState = {
  isOpen: false,
  message: '',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function formatDebugError(err: unknown): string | null {
  if (err instanceof Error) {
    const details = [
      err.name ? `name=${err.name}` : null,
      err.message ? `message=${err.message}` : null,
      isRecord(err) && typeof err.error === 'string'
        ? `error=${err.error}`
        : null,
      isRecord(err) && typeof err.code === 'string' ? `code=${err.code}` : null,
      isRecord(err) && typeof err.details === 'string'
        ? `details=${err.details}`
        : null,
      isRecord(err) && typeof err.hint === 'string' ? `hint=${err.hint}` : null,
    ].filter(Boolean);

    return details.join(' ');
  }

  if (isRecord(err)) {
    const details = [
      typeof err.error === 'string' ? `error=${err.error}` : null,
      typeof err.code === 'string' ? `code=${err.code}` : null,
      typeof err.message === 'string' ? `message=${err.message}` : null,
      typeof err.details === 'string' ? `details=${err.details}` : null,
      typeof err.hint === 'string' ? `hint=${err.hint}` : null,
      typeof err.status === 'number' ? `status=${err.status}` : null,
    ].filter(Boolean);

    if (details.length > 0) {
      return details.join(' ');
    }
  }

  if (typeof err === 'string') {
    return `message=${err}`;
  }

  return null;
}

function normalizeDebugValue(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function parseDebugPairs(raw: string): Array<{ key: string; value: string }> {
  const normalized = normalizeDebugValue(raw);
  if (!normalized) return [];

  const tokenPattern = /([a-z_]+)=/gi;
  const tokens: Array<{ key: string; start: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(normalized)) !== null) {
    tokens.push({ key: match[1], start: match.index });
  }

  if (tokens.length === 0) {
    return [{ key: 'error', value: normalized }];
  }

  return tokens.map((token, index) => {
    const nextTokenStart = tokens[index + 1]?.start ?? normalized.length;
    const chunk = normalized.slice(token.start, nextTokenStart).trim();
    const separatorIndex = chunk.indexOf('=');
    if (separatorIndex === -1) {
      return { key: token.key, value: '' };
    }

    return {
      key: token.key,
      value: chunk.slice(separatorIndex + 1).trim(),
    };
  });
}

function formatDebugBlock(options?: RequestErrorOpenOptions): string | null {
  const lines: string[] = [];

  if (options?.source) {
    lines.push(`source: ${options.source}`);
  }

  if (options?.err) {
    const rawDebug = formatDebugError(options.err);
    if (rawDebug) {
      const pairs = parseDebugPairs(rawDebug);
      for (const pair of pairs) {
        if (!pair.value) continue;
        lines.push(`${pair.key}: ${pair.value}`);
      }
    }
  }

  if (lines.length === 0) {
    return null;
  }

  return `[debug]\n${lines.join('\n')}`;
}

function withRequestDebugDetails(
  baseMessage: string,
  options?: RequestErrorOpenOptions,
): string {
  if (process.env.NODE_ENV !== 'development') {
    return baseMessage;
  }

  const debugBlock = formatDebugBlock(options);
  if (!debugBlock) {
    return baseMessage;
  }

  return `${baseMessage}\n\n${debugBlock}`;
}

export function useRequestErrorModal() {
  const requestErrorContext = useRequestErrorContext();
  const [state, setState] = useState<RequestErrorState>(INITIAL_STATE);

  const openRequestError = useCallback(
    (message: string, options?: RequestErrorOpenOptions) => {
      if (!message) return;
      const messageWithDebug = withRequestDebugDetails(message, options);

      if (process.env.NODE_ENV === 'development' && options?.err) {
        console.error('[RequestErrorModal]', {
          source: options.source ?? 'unknown',
          message,
          err: options.err,
        });
      }

      if (requestErrorContext) {
        requestErrorContext.openRequestError(messageWithDebug, {
          title: options?.title,
          closeLabel: options?.closeLabel,
        });
        return;
      }
      setState({ isOpen: true, message: messageWithDebug });
    },
    [requestErrorContext],
  );

  const closeRequestError = useCallback(
    () => {
      if (requestErrorContext) {
        requestErrorContext.closeRequestError();
        return;
      }
      setState(INITIAL_STATE);
    },
    [requestErrorContext],
  );

  if (requestErrorContext) {
    // Global provider owns modal rendering.
    return {
      isRequestErrorOpen: false,
      requestErrorMessage: '',
      openRequestError,
      closeRequestError,
    };
  }

  return {
    isRequestErrorOpen: state.isOpen,
    requestErrorMessage: state.message,
    openRequestError,
    closeRequestError,
  };
}
