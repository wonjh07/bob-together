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

interface RequestErrorOptions {
  title?: string;
  closeLabel?: string;
}

interface RequestErrorContextValue {
  openRequestError: (message: string, options?: RequestErrorOptions) => void;
  closeRequestError: () => void;
}

const RequestErrorContext = createContext<RequestErrorContextValue | null>(null);

interface RequestErrorProviderProps {
  children: ReactNode;
}

export function RequestErrorProvider({ children }: RequestErrorProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('요청 처리 실패');
  const [closeLabel, setCloseLabel] = useState('확인');

  const openRequestError = useCallback(
    (nextMessage: string, options?: RequestErrorOptions) => {
      if (!nextMessage) return;
      setMessage(nextMessage);
      setTitle(options?.title || '요청 처리 실패');
      setCloseLabel(options?.closeLabel || '확인');
      setIsOpen(true);
    },
    [],
  );

  const closeRequestError = useCallback(() => {
    setIsOpen(false);
    setMessage('');
    setTitle('요청 처리 실패');
    setCloseLabel('확인');
  }, []);

  const value = useMemo<RequestErrorContextValue>(
    () => ({ openRequestError, closeRequestError }),
    [closeRequestError, openRequestError],
  );

  return (
    <RequestErrorContext.Provider value={value}>
      {children}
      <RequestErrorModal
        isOpen={isOpen}
        title={title}
        closeLabel={closeLabel}
        message={message}
        onClose={closeRequestError}
      />
    </RequestErrorContext.Provider>
  );
}

export function useRequestErrorContext() {
  return useContext(RequestErrorContext);
}
