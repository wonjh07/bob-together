import Link from 'next/link';

import ClockIcon from '@/components/icons/ClockIcon';
import CommentIcon from '@/components/icons/CommentIcon';
import GroupIcon from '@/components/icons/GroupIcon';
import ReviewIcon from '@/components/icons/ReviewIcon';

import * as styles from './ProfileQuickLinks.css';

export function ProfileQuickLinks() {
  return (
    <div className={styles.container}>
      <Link className={styles.itemLink} href="/dashboard/profile/groups">
        <span className={styles.item}>
          <GroupIcon size={28} className={styles.icon} />
          <span className={styles.label}>그룹</span>
        </span>
      </Link>
      <Link className={styles.itemLink} href="/dashboard/profile/history">
        <span className={styles.item}>
          <ClockIcon size={28} className={styles.icon} />
          <span className={styles.label}>지난 약속</span>
        </span>
      </Link>
      <Link className={styles.itemLink} href="/dashboard/profile/reviews">
        <span className={styles.item}>
          <ReviewIcon size={28} className={styles.icon} />
          <span className={styles.label}>리뷰</span>
        </span>
      </Link>
      <Link className={styles.itemLink} href="/dashboard/profile/comments">
        <span className={styles.item}>
          <CommentIcon size={28} className={styles.icon} />
          <span className={styles.label}>댓글</span>
        </span>
      </Link>
    </div>
  );
}
