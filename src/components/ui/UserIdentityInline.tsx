import Image from 'next/image';

import * as styles from './UserIdentityInline.css';

function cx(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

const AVATAR_SIZE_MAP = {
  xs: 28,
  sm: 30,
  md: 36,
  lg: 42,
  xl: 56,
} as const;

type AvatarSize = keyof typeof AVATAR_SIZE_MAP;

interface UserIdentityInlineProps {
  name: string;
  avatarSrc?: string | null;
  avatarAlt: string;
  avatarSize?: AvatarSize;
  me?: boolean;
  meLabel?: string;
  subtitle?: string;
  rowClassName?: string;
  avatarClassName?: string;
  textWrapClassName?: string;
  nameRowClassName?: string;
  nameClassName?: string;
  meClassName?: string;
  subtitleClassName?: string;
}

export default function UserIdentityInline({
  name,
  avatarSrc,
  avatarAlt,
  avatarSize = 'md',
  me = false,
  meLabel = 'me',
  subtitle,
  rowClassName,
  avatarClassName,
  textWrapClassName,
  nameRowClassName,
  nameClassName,
  meClassName,
  subtitleClassName,
}: UserIdentityInlineProps) {
  const imageSize = AVATAR_SIZE_MAP[avatarSize];

  return (
    <div className={cx(styles.row, rowClassName)}>
      <Image
        src={avatarSrc || '/profileImage.png'}
        alt={avatarAlt}
        width={imageSize}
        height={imageSize}
        className={cx(styles.avatar, styles.avatarSize[avatarSize], avatarClassName)}
      />
      <div className={cx(styles.textWrap, textWrapClassName)}>
        <div className={cx(styles.nameRow, nameRowClassName)}>
          <span className={cx(styles.name, nameClassName)}>{name}</span>
          {me ? <span className={cx(styles.meText, meClassName)}>{meLabel}</span> : null}
        </div>
        {subtitle ? (
          <p className={cx(styles.subtitle, subtitleClassName)}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
