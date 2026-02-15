import Image from 'next/image';

import GroupIcon from '@/components/icons/GroupIcon';

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
          <Image
            src={ownerProfileImage || '/profileImage.png'}
            alt={`${name} 프로필`}
            width={28}
            height={28}
            className={styles.ownerAvatar}
          />
          <span className={styles.ownerName}>{name}</span>
          <span className={styles.memberMeta}>
            <GroupIcon width="16" height="16" />
            {memberCount}명
          </span>
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
