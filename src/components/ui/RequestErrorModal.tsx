'use client';

import { useEffect, useState } from 'react';

import * as styles from './RequestErrorModal.css';

interface RequestErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose?: () => void;
  title?: string;
  closeLabel?: string;
}

interface ParsedMessage {
  userMessage: string;
  debugMessage: string | null;
}

function parseMessage(message: string): ParsedMessage {
  const marker = '\n\n[debug]\n';
  const markerIndex = message.indexOf(marker);

  if (markerIndex === -1) {
    return {
      userMessage: message,
      debugMessage: null,
    };
  }

  return {
    userMessage: message.slice(0, markerIndex),
    debugMessage: message.slice(markerIndex + marker.length).trim(),
  };
}

export default function RequestErrorModal({
  isOpen,
  message,
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

  const { userMessage, debugMessage } = parseMessage(message);

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
          <p className={styles.message}>{userMessage}</p>
          {debugMessage ? (
            <div className={styles.debugBox}>
              <p className={styles.debugTitle}>디버그 정보</p>
              <pre className={styles.debugMessage}>{debugMessage}</pre>
            </div>
          ) : null}
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
