import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';

import * as styles from './ReviewsWaitList.css';

type ReviewWaitItem = {
  id: string;
  title: string;
  ratingScore: number;
  ratingCount: number;
  date: string;
  timeRange: string;
};

const DUMMY_WAIT_REVIEWS: ReviewWaitItem[] = [
  {
    id: '1',
    title: '원짜째',
    ratingScore: 4.5,
    ratingCount: 12,
    date: '2025.01.14',
    timeRange: '13:00-14:00',
  },
  {
    id: '2',
    title: '점심 약속',
    ratingScore: 4.5,
    ratingCount: 12,
    date: '2025.01.14',
    timeRange: '13:00-14:00',
  },
  {
    id: '3',
    title: '퇴근 후 모임',
    ratingScore: 4.5,
    ratingCount: 12,
    date: '2025.01.14',
    timeRange: '13:00-14:00',
  },
  {
    id: '4',
    title: '퇴근 후 모임',
    ratingScore: 4.5,
    ratingCount: 12,
    date: '2025.01.14',
    timeRange: '13:00-14:00',
  },
];

export function ReviewsWaitList() {
  return (
    <section className={styles.container}>
      <div className={styles.scrollRow}>
        {DUMMY_WAIT_REVIEWS.map((review) => (
          <article key={review.id} className={styles.card}>
            <div className={styles.title}>{review.title}</div>
            <div className={styles.scoreRow}>
              <span className={styles.star}>★</span>
              <span className={styles.score}>{review.ratingScore}</span>
              <span className={styles.score}>({review.ratingCount})</span>
            </div>
            <div className={styles.infoRow}>
              <CalendarIcon width="18" height="18" />
              <span>{review.date}</span>
            </div>
            <div className={styles.infoRow}>
              <ClockIcon width="18" height="18" />
              <span>{review.timeRange}</span>
            </div>
            <button type="button" className={styles.writeButton}>
              리뷰 남기기
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
