'use client';

import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';

import PaperPlaneIcon from '@/components/icons/PaperPlaneIcon';

import * as styles from './AppointmentCommentsSection.css';

interface AppointmentCommentComposerProps {
  content: string;
  errorMessage: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
}

export default function AppointmentCommentComposer({
  content,
  errorMessage,
  isSubmitting,
  onChange,
  onSubmit,
}: AppointmentCommentComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = '0px';
    element.style.height = `${element.scrollHeight}px`;
  }, [content]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter') return;
    if (event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <>
      <form className={styles.inputWrap} onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.input}
          placeholder="댓글을 입력해주세요"
          maxLength={200}
          rows={1}
        />
        <button
          type="submit"
          className={styles.submitButton}
          aria-label="댓글 등록"
          disabled={isSubmitting}>
          <PaperPlaneIcon className={styles.planeIcon} />
        </button>
      </form>
      <p className={styles.helperText}>{errorMessage}</p>
    </>
  );
}
