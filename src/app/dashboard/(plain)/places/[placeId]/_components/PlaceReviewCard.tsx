'use client';

import StarRatingDisplay from '@/components/ui/StarRatingDisplay';
import UserIdentityInline from '@/components/ui/UserIdentityInline';
import { formatRelativeKorean } from '@/utils/dateFormat';

import * as styles from './PlaceReviewCard.css';

import type { PlaceReviewItem } from '@/actions/place';

interface PlaceReviewCardProps {
  review: PlaceReviewItem;
}

export default function PlaceReviewCard({ review }: PlaceReviewCardProps) {
  const displayName = review.userNickname || review.userName || '알 수 없음';
  const relativeText = formatRelativeKorean(review.editedAt);
  const subtitle = [review.userName, relativeText].filter(Boolean).join(' · ');

  return (
    <article className={styles.card}>
      <div className={styles.headRow}>
        <UserIdentityInline
          name={displayName}
          subtitle={subtitle}
          avatarSrc={review.userProfileImage}
          avatarAlt={`${displayName} 프로필`}
          avatarSize="xl"
          rowClassName={styles.userRow}
          avatarClassName={styles.avatar}
          nameClassName={styles.name}
          subtitleClassName={styles.meta}
        />
        <button
          type="button"
          className={styles.moreButton}
          aria-label="리뷰 메뉴"
          disabled>
          ⋮
        </button>
      </div>

      <StarRatingDisplay
        score={review.score}
        rowClassName={styles.starRow}
        filledClassName={styles.starFilled}
        emptyClassName={styles.starEmpty}
      />

      {review.content ? (
        <p className={styles.content}>{review.content}</p>
      ) : null}
    </article>
  );
}
