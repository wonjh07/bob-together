'use client';

import OverflowMenu from '@/components/ui/OverflowMenu';
import { formatDateDot } from '@/utils/dateFormat';

import * as styles from './MyReviewCard.css';

import type { MyReviewItem } from '@/actions/appointment';

interface MyReviewCardProps {
  review: MyReviewItem;
  isMenuOpen: boolean;
  isDeleting: boolean;
  onToggleMenu: (appointmentId: string) => void;
  onCloseMenu: () => void;
  onDeleteReview: (appointmentId: string) => void;
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
  return (
    <article className={styles.card}>
      <div className={styles.headRow}>
        <h2 className={styles.placeName}>{review.placeName}</h2>
        <OverflowMenu
          isOpen={isMenuOpen}
          isDisabled={isDeleting}
          ariaLabel="리뷰 메뉴"
          onToggle={() => onToggleMenu(review.appointmentId)}
          onClose={onCloseMenu}
          items={[
            {
              key: 'edit',
              label: '리뷰 수정',
              href: `/dashboard/profile/reviews/${review.appointmentId}`,
            },
            {
              key: 'delete',
              label: '리뷰 삭제',
              danger: true,
              onClick: () => onDeleteReview(review.appointmentId),
            },
          ]}
        />
      </div>

      <div className={styles.starRow}>{renderStars(review.score)}</div>
      {review.content ? <p className={styles.content}>{review.content}</p> : null}
      <p className={styles.date}>{formatDateDot(review.editedAt)}</p>
    </article>
  );
}
