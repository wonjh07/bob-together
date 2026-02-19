'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import CalendarIcon from '@/components/icons/CalendarIcon';

import * as styles from './MyCommentCard.css';

import type { MyCommentItem } from '@/actions/appointment';

interface MyCommentCardProps {
  comment: MyCommentItem;
  isMenuOpen: boolean;
  isDeleting: boolean;
  onToggleMenu: (commentId: string) => void;
  onCloseMenu: () => void;
  onDeleteComment: (appointmentId: string, commentId: string) => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export default function MyCommentCard({
  comment,
  isMenuOpen,
  isDeleting,
  onToggleMenu,
  onCloseMenu,
  onDeleteComment,
}: MyCommentCardProps) {
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuWrapRef.current?.contains(target)) return;
      onCloseMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isMenuOpen, onCloseMenu]);

  return (
    <article className={styles.card}>
      <div className={styles.headerRow}>
        <div className={styles.titleRow}>
          <CalendarIcon className={styles.calendarIcon} />
          <h2 className={styles.title}>{comment.appointmentTitle}</h2>
        </div>

        <div ref={menuWrapRef} className={styles.menuWrap}>
          <button
            type="button"
            className={styles.moreButton}
            onClick={() => onToggleMenu(comment.commentId)}
            aria-label="댓글 메뉴"
            disabled={isDeleting}>
            ⋮
          </button>

          {isMenuOpen ? (
            <div className={styles.dropdown}>
              <Link
                href={`/dashboard/appointments/${comment.appointmentId}`}
                className={styles.dropdownLink}
                onClick={onCloseMenu}>
                약속 상세 보기
              </Link>
              <button
                type="button"
                className={`${styles.dropdownButton} ${styles.dropdownDanger}`}
                onClick={() =>
                  onDeleteComment(comment.appointmentId, comment.commentId)
                }
                disabled={isDeleting}>
                댓글 삭제
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <p className={styles.content}>{comment.content}</p>
      <p className={styles.date}>{formatDate(comment.createdAt)}</p>
    </article>
  );
}

