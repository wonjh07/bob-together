import Link from 'next/link';

import ClockIcon from '@/components/icons/ClockIcon';
import CommentIcon from '@/components/icons/CommentIcon';
import GroupIcon from '@/components/icons/GroupIcon';
import ReviewIcon from '@/components/icons/ReviewIcon';

import * as styles from './ProfileQuickLinks.css';

export function ProfileQuickLinks() {
  return (
    <div className={styles.container}>
      <Link className={styles.item} href="/dashboard/profile/groups">
        <GroupIcon className={styles.icon} />
        <span className={styles.label}>그룹</span>
      </Link>
      <Link className={styles.item} href="/dashboard/profile/history">
        <ClockIcon className={styles.icon} />
        <span className={styles.label}>지난 약속</span>
      </Link>
      <Link className={styles.item} href="/dashboard/profile/reviews">
        <ReviewIcon className={styles.icon} />
        <span className={styles.label}>리뷰</span>
      </Link>
      <Link className={styles.item} href="/dashboard/profile/comments">
        <CommentIcon className={styles.icon} />
        <span className={styles.label}>댓글</span>
      </Link>
    </div>
  );
}
