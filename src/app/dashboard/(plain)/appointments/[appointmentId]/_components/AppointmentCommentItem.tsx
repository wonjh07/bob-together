'use client';

import Image from 'next/image';
import { memo, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

import OverflowMenu from '@/components/ui/OverflowMenu';
import { formatRelativeKorean } from '@/utils/dateFormat';

import * as styles from './AppointmentCommentsSection.css';

import type { AppointmentCommentItem } from '@/actions/appointment';

interface AppointmentCommentItemProps {
  comment: AppointmentCommentItem;
  currentUserId: string | null;
  isBusy: boolean;
  onUpdate: (commentId: string, content: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
}

function AppointmentCommentItem({
  comment,
  currentUserId,
  isBusy,
  onUpdate,
  onDelete,
}: AppointmentCommentItemProps) {
  const displayName = comment.nickname || comment.name || '알 수 없음';
  const meta = [comment.name, formatRelativeKorean(comment.createdAt)]
    .filter(Boolean)
    .join(' · ');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(comment.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditingContent(comment.content);
    }
  }, [comment.content, isEditing]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = '0px';
    element.style.height = `${element.scrollHeight}px`;
  }, [editingContent, isEditing]);

  const handleSubmitOnEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter') return;
    if (event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const handleStartEdit = () => {
    setIsMenuOpen(false);
    setIsEditing(true);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingContent(comment.content);
  };

  const handleSubmitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy) return;

    const trimmed = editingContent.trim();
    if (!trimmed) return;

    const ok = await onUpdate(comment.commentId, trimmed);
    if (!ok) return;
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (isBusy) return;
    setIsMenuOpen(false);
    await onDelete(comment.commentId);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardLeft}>
        <Image
          src={comment.profileImage || '/profileImage.png'}
          alt="댓글 작성자 프로필 이미지"
          width={44}
          height={44}
          className={styles.avatar}
        />
        <div className={styles.cardBody}>
          <p className={styles.nickname}>{displayName}</p>
          <p className={styles.meta}>{meta}</p>
          {isEditing ? (
            <form className={styles.editForm} onSubmit={handleSubmitEdit}>
              <div className={styles.editInputWrap}>
                <textarea
                  ref={textareaRef}
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  onKeyDown={handleSubmitOnEnter}
                  className={styles.input}
                  placeholder="댓글을 입력해주세요"
                  maxLength={200}
                  rows={1}
                />
              </div>
              <div className={styles.editActions}>
                <button
                  type="button"
                  className={styles.editCancelButton}
                  onClick={handleCancelEdit}
                  disabled={isBusy}>
                  취소
                </button>
                <button
                  type="submit"
                  className={styles.editSubmitButton}
                  disabled={isBusy}>
                  수정
                </button>
              </div>
            </form>
          ) : (
            <p className={styles.content}>{comment.content}</p>
          )}
        </div>
      </div>
      {comment.userId === currentUserId ? (
        <OverflowMenu
          isOpen={isMenuOpen}
          isDisabled={isBusy}
          ariaLabel="댓글 메뉴"
          onToggle={() => setIsMenuOpen((prev) => !prev)}
          onClose={() => setIsMenuOpen(false)}
          items={[
            {
              key: 'edit',
              label: '댓글 수정',
              onClick: handleStartEdit,
            },
            {
              key: 'delete',
              label: '댓글 삭제',
              danger: true,
              onClick: handleDelete,
            },
          ]}
        />
      ) : null}
    </div>
  );
}

export default memo(AppointmentCommentItem);
