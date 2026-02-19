import Link from 'next/link';

import { listReviewableAppointmentsAction } from '@/actions/appointment';
import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';

import * as styles from './ReviewsWaitList.css';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export async function ReviewsWaitList() {
  const result = await listReviewableAppointmentsAction();
  const items = result.ok && result.data ? result.data.appointments : [];

  if (items.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>작성 가능한 리뷰가 없습니다.</div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.scrollRow}>
        {items.map((review) => {
          const scoreLabel =
            review.reviewAverage !== null ? review.reviewAverage.toFixed(1) : '-';

          return (
            <article key={review.appointmentId} className={styles.card}>
              <div className={styles.title}>{review.title}</div>
              <div className={styles.scoreRow}>
                <span className={styles.star}>★</span>
                <span className={styles.score}>{scoreLabel}</span>
                <span className={styles.score}>({review.reviewCount})</span>
              </div>
              <div className={styles.infoRow}>
                <CalendarIcon width="18" height="18" />
                <span>{formatDate(review.startAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <ClockIcon width="18" height="18" />
                <span>
                  {formatTime(review.startAt)}-{formatTime(review.endsAt)}
                </span>
              </div>
              <Link
                href={`/dashboard/profile/reviews/${review.appointmentId}`}
                className={styles.writeButton}>
                리뷰 남기기
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
