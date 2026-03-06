'use client';

import { useEffect, useState } from 'react';

import * as styles from './RequestErrorModal.css';

import type { ServiceErrorCode } from '@/actions/_common/service-action';

interface RequestErrorModalProps {
  isOpen: boolean;
  message: string;
  errorType: ServiceErrorCode;
  onClose?: () => void;
  title?: string;
  closeLabel?: string;
}

export default function RequestErrorModal({
  isOpen,
  message,
  errorType,
  onClose,
  title = '요청 처리 실패',
  closeLabel = '확인',
}: RequestErrorModalProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDismissed(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    setDismissed(true);
  };

  const shouldRender = isOpen && !dismissed && Boolean(message);

  useEffect(() => {
    if (!shouldRender) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={handleClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}>
        <div className={styles.body}>
          <p className={styles.title}>{title}</p>
          <p className={styles.message}>{message}</p>
          <p className={styles.errorType}>에러 타입: {errorType}</p>
        </div>
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
