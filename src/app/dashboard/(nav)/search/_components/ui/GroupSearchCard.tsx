import IconLabel from '@/components/ui/IconLabel';
import UserIdentityInline from '@/components/ui/UserIdentityInline';

import * as styles from './GroupSearchCard.css';

interface GroupSearchCardProps {
  groupId: string;
  title: string;
  name: string;
  ownerProfileImage: string | null;
  memberCount: number;
  isMember: boolean;
  isJoining: boolean;
  onJoin: (groupId: string) => void;
}

export default function GroupSearchCard({
  groupId,
  title,
  name,
  ownerProfileImage,
  memberCount,
  isMember,
  isJoining,
  onJoin,
}: GroupSearchCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subRow}>
          <UserIdentityInline
            name={name}
            avatarSrc={ownerProfileImage}
            avatarAlt={`${name} 프로필`}
            size="sm"
          />

          <IconLabel as="span" icon="group" count={`${memberCount}명`} />
        </div>
      </div>
      <button
        type="button"
        className={isMember ? styles.memberButton : styles.joinButton}
        disabled={isMember || isJoining}
        onClick={() => onJoin(groupId)}>
        {isMember ? '내그룹' : isJoining ? '가입 중...' : '가입하기'}
      </button>
    </div>
  );
}
