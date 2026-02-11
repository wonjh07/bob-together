import Link from 'next/link';

import * as styles from './ProfileReviewHeader.css';

export default function ProfileReviewHeader() {

  return (
    <div className={styles.headerContainer}>
      <a className={styles.headerTitle}>작성 가능한 리뷰</a>
      <Link href="/dashboard/reviews">
        <span className={styles.headerSubText}>전체보기</span>
      </Link>
    </div>
  );
}
