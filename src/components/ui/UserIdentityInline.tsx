import Image from 'next/image';

import * as styles from './UserIdentityInline.css';

const AVATAR_SIZE_MAP = {
  sm: 30,
  md: 42,
  lg: 56,
} as const;

type UserIdentitySize = keyof typeof AVATAR_SIZE_MAP;

interface UserIdentityInlineProps {
  name: string;
  avatarSrc?: string | null;
  avatarAlt: string;
  size?: UserIdentitySize;
  me?: boolean;
  meLabel?: string;
  subtitle?: string;
}

export default function UserIdentityInline({
  name,
  avatarSrc,
  avatarAlt,
  size = 'md',
  me = false,
  meLabel = 'me',
  subtitle,
}: UserIdentityInlineProps) {
  const imageSize = AVATAR_SIZE_MAP[size];

  return (
    <div className={`${styles.row} ${styles.rowSize[size]}`}>
      <Image
        src={avatarSrc || '/profileImage.png'}
        alt={avatarAlt}
        width={imageSize}
        height={imageSize}
        className={`${styles.avatar} ${styles.avatarSize[size]}`}
      />
      <div className={`${styles.textWrap} ${styles.textWrapSize[size]}`}>
        <div className={styles.nameRow}>
          <span className={`${styles.name} ${styles.nameSize[size]}`}>{name}</span>
          {me ? <span className={styles.meText}>{meLabel}</span> : null}
        </div>
        {subtitle ? (
          <p className={`${styles.subtitle} ${styles.subtitleSize[size]}`}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
