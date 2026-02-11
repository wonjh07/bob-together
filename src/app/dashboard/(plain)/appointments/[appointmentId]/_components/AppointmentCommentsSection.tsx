'use client';

import Image from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import toast from 'react-hot-toast';

import {
  createAppointmentCommentAction,
  type AppointmentCommentItem,
} from '@/actions/appointment';
import CommentIcon from '@/components/icons/CommentIcon';
import PaperPlaneIcon from '@/components/icons/PaperPlaneIcon';

import * as styles from './AppointmentCommentsSection.css';

interface AppointmentCommentsSectionProps {
  appointmentId: string;
  initialComments: AppointmentCommentItem[];
  initialCommentCount: number;
}

function formatRelative(createdAt: string): string {
  const created = new Date(createdAt);
  const diff = Date.now() - created.getTime();

  if (Number.isNaN(created.getTime()) || diff < 0) {
    return '';
  }

  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) {
    return `${Math.max(1, minutes)}분전`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}시간전`;
  }

  const days = Math.floor(hours / 24);
  return `${days}일전`;
}

export default function AppointmentCommentsSection({
  appointmentId,
  initialComments,
  initialCommentCount,
}: AppointmentCommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = '0px';
    element.style.height = `${element.scrollHeight}px`;
  }, [content]);

  const submitComment = async () => {
    if (isSubmitting) return;

    const trimmed = content.trim();
    if (!trimmed) {
      setErrorMessage('댓글을 입력해주세요.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const result = await createAppointmentCommentAction({
      appointmentId,
      content: trimmed,
    });

    setIsSubmitting(false);

    if (!result.ok || !result.data) {
      const message = !result.ok
        ? result.message || '댓글 작성에 실패했습니다.'
        : '댓글 작성에 실패했습니다.';
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    const nextComment = result.data.comment;
    const nextCount = result.data.commentCount;
    setComments((prev) => [...prev, nextComment]);
    setCommentCount(nextCount);
    setContent('');
    toast.success('댓글이 등록되었습니다.');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitComment();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter') return;
    if (event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span>댓글</span>
        <CommentIcon className={styles.commentIcon} />
        <span className={styles.count}>{commentCount}</span>
      </div>

      <form className={styles.inputWrap} onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleInputKeyDown}
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

      {comments.length > 0 ? (
        <div className={styles.list}>
          {comments.map((comment) => {
            const displayName = comment.nickname || comment.name || '알 수 없음';
            const meta = [comment.name, formatRelative(comment.createdAt)]
              .filter(Boolean)
              .join(' · ');

            return (
              <div key={comment.commentId} className={styles.card}>
                <div className={styles.cardLeft}>
                  <Image
                    src={comment.profileImage || '/profileImage.png'}
                    alt="댓글 작성자 프로필 이미지"
                    width={56}
                    height={56}
                    className={styles.avatar}
                    unoptimized
                  />
                  <div className={styles.cardBody}>
                    <p className={styles.nickname}>{displayName}</p>
                    <p className={styles.meta}>{meta}</p>
                    <p className={styles.content}>{comment.content}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.moreButton}
                  aria-label="댓글 메뉴">
                  ⋮
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.empty}>아직 댓글이 없습니다.</p>
      )}
    </div>
  );
}
