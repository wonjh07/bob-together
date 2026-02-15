import Image from 'next/image';
import Link from 'next/link';

import SettingsIcon from '@/components/icons/SettingsIcon';

import * as styles from './ProfileSummary.css';

type ProfileSummaryProps = {
  nickname: string;
  profileImage: string | null;
};

export function ProfileSummary({
  nickname,
  profileImage,
}: ProfileSummaryProps) {
  const profileSrc = profileImage ?? '/profileImage.png';

  return (
    <div className={styles.container}>
      <div className={styles.userInfo}>
        <Image
          src={profileSrc}
          alt="프로필"
          width={42}
          height={42}
          className={styles.avatar}
        />
        <div className={styles.nickname}>{nickname}</div>
      </div>
      <Link
        href="/dashboard/profile/edit"
        className={styles.settingsButton}
        aria-label="정보 변경">
        <SettingsIcon className={styles.settingsIcon} />
      </Link>
    </div>
  );
}
