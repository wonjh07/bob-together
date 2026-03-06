'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import RequestErrorModal from '@/components/ui/RequestErrorModal';

import type { ServiceErrorCode } from '@/actions/_common/service-action';

interface RequestErrorOptions {
  title?: string;
  closeLabel?: string;
  errorType?: ServiceErrorCode;
  ownerId?: string;
}

interface RequestErrorContextValue {
  openRequestError: (message: string, options?: RequestErrorOptions) => void;
  closeRequestError: () => void;
  closeOwnedRequestError: (ownerId: string) => void;
}

const RequestErrorContext = createContext<RequestErrorContextValue | null>(null);

const DEFAULT_REQUEST_ERROR_TITLE = '요청 처리 실패';
const DEFAULT_REQUEST_ERROR_CLOSE_LABEL = '확인';

interface RequestErrorState {
  isOpen: boolean;
  message: string;
  title: string;
  closeLabel: string;
  errorType: ServiceErrorCode;
  ownerId?: string;
}

const INITIAL_STATE: RequestErrorState = {
  isOpen: false,
  message: '',
  title: DEFAULT_REQUEST_ERROR_TITLE,
  closeLabel: DEFAULT_REQUEST_ERROR_CLOSE_LABEL,
  errorType: 'server',
  ownerId: undefined,
};

interface RequestErrorProviderProps {
  children: ReactNode;
}

export function RequestErrorProvider({ children }: RequestErrorProviderProps) {
  const [state, setState] = useState<RequestErrorState>(INITIAL_STATE);

  const openRequestError = useCallback(
    (nextMessage: string, options?: RequestErrorOptions) => {
      if (!nextMessage) return;
      setState({
        isOpen: true,
        message: nextMessage,
        title: options?.title ?? DEFAULT_REQUEST_ERROR_TITLE,
        closeLabel: options?.closeLabel ?? DEFAULT_REQUEST_ERROR_CLOSE_LABEL,
        errorType: options?.errorType ?? 'server',
        ownerId: options?.ownerId,
      });
    },
    [],
  );

  const closeRequestError = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const closeOwnedRequestError = useCallback((ownerId: string) => {
    setState((prev) => {
      if (!prev.isOpen || prev.ownerId !== ownerId) {
        return prev;
      }

      return INITIAL_STATE;
    });
  }, []);

  const value = useMemo<RequestErrorContextValue>(
    () => ({ openRequestError, closeRequestError, closeOwnedRequestError }),
    [closeOwnedRequestError, closeRequestError, openRequestError],
  );

  return (
    <RequestErrorContext.Provider value={value}>
      {children}
      <RequestErrorModal
        isOpen={state.isOpen}
        title={state.title}
        closeLabel={state.closeLabel}
        message={state.message}
        errorType={state.errorType}
        onClose={closeRequestError}
      />
    </RequestErrorContext.Provider>
  );
}

export function useRequestErrorContext() {
  return useContext(RequestErrorContext);
}
