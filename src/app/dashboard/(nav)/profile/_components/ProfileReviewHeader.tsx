import Link from 'next/link';

import * as styles from './ProfileReviewHeader.css';

export default function ProfileReviewHeader() {
  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.headerTitle}>작성 가능한 리뷰</h2>
      <Link href="/dashboard/profile/reviews/waitlist">
        <span className={styles.headerSubText}>전체보기</span>
      </Link>
    </div>
  );
}
