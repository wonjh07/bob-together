import UserCircleIcon from '@/components/icons/UserCircleIcon';

import * as styles from './GroupSearchCard.css';

interface GroupSearchCardProps {
  title: string;
  name: string;
  memberCount: number;
  isMember: boolean;
}

export default function GroupSearchCard({
  title,
  name,
  memberCount,
  isMember,
}: GroupSearchCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subRow}>
          <span className={styles.userIcon}>
            <UserCircleIcon width="20" height="20" />
          </span>
          <span>
            {name} / {memberCount}명
          </span>
        </div>
      </div>
      <button
        type="button"
        className={isMember ? styles.memberButton : styles.joinButton}
        disabled={isMember}>
        {isMember ? '내그룹' : '가입하기'}
      </button>
    </div>
  );
}
