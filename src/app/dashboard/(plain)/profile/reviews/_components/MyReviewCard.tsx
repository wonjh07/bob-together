'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import * as styles from './MyReviewCard.css';

import type { MyReviewItem } from '@/actions/appointment';

interface MyReviewCardProps {
  review: MyReviewItem;
  isMenuOpen: boolean;
  isDeleting: boolean;
  onToggleMenu: (placeId: string) => void;
  onCloseMenu: () => void;
  onDeleteReview: (placeId: string) => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function renderStars(score: number) {
  return Array.from({ length: 5 }).map((_, index) => {
    const filled = index < score;
    return (
      <span key={index} className={filled ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    );
  });
}

export default function MyReviewCard({
  review,
  isMenuOpen,
  isDeleting,
  onToggleMenu,
  onCloseMenu,
  onDeleteReview,
}: MyReviewCardProps) {
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
      <div className={styles.headRow}>
        <h2 className={styles.placeName}>{review.placeName}</h2>
        <div ref={menuWrapRef} className={styles.menuWrap}>
          <button
            type="button"
            className={styles.moreButton}
            onClick={() => onToggleMenu(review.placeId)}
            aria-label="리뷰 메뉴"
            disabled={isDeleting}>
            ⋮
          </button>
          {isMenuOpen ? (
            <div className={styles.dropdown}>
              {review.appointmentId ? (
                <Link
                  href={`/dashboard/profile/reviews/${review.appointmentId}`}
                  className={styles.dropdownLink}
                  onClick={onCloseMenu}>
                  리뷰 수정
                </Link>
              ) : (
                <span className={styles.dropdownDisabled}>리뷰 수정</span>
              )}
              <button
                type="button"
                className={`${styles.dropdownButton} ${styles.dropdownDanger}`}
                onClick={() => onDeleteReview(review.placeId)}
                disabled={isDeleting}>
                리뷰 삭제
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.starRow}>{renderStars(review.score)}</div>
      {review.content ? <p className={styles.content}>{review.content}</p> : null}
      <p className={styles.date}>{formatDate(review.editedAt)}</p>
    </article>
  );
}
