import Link from 'next/link';

import ClockIcon from '@/components/icons/ClockIcon';
import CommentIcon from '@/components/icons/CommentIcon';
import GroupIcon from '@/components/icons/GroupIcon';
import ReviewIcon from '@/components/icons/ReviewIcon';
import IconStackLabel from '@/components/ui/IconStackLabel';

import * as styles from './ProfileQuickLinks.css';

export function ProfileQuickLinks() {
  return (
    <div className={styles.container}>
      <Link className={styles.itemLink} href="/dashboard/profile/groups">
        <IconStackLabel
          as="span"
          className={styles.item}
          icon={<GroupIcon className={styles.icon} />}
          label="그룹"
          labelClassName={styles.label}
        />
      </Link>
      <Link className={styles.itemLink} href="/dashboard/profile/history">
        <IconStackLabel
          as="span"
          className={styles.item}
          icon={<ClockIcon className={styles.icon} />}
          label="지난 약속"
          labelClassName={styles.label}
        />
      </Link>
      <Link className={styles.itemLink} href="/dashboard/profile/reviews">
        <IconStackLabel
          as="span"
          className={styles.item}
          icon={<ReviewIcon className={styles.icon} />}
          label="리뷰"
          labelClassName={styles.label}
        />
      </Link>
      <Link className={styles.itemLink} href="/dashboard/profile/comments">
        <IconStackLabel
          as="span"
          className={styles.item}
          icon={<CommentIcon className={styles.icon} />}
          label="댓글"
          labelClassName={styles.label}
        />
      </Link>
    </div>
  );
}
