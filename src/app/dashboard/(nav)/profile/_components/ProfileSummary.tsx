import Link from 'next/link';

import SettingsIcon from '@/components/icons/SettingsIcon';
import UserIdentityInline from '@/components/ui/UserIdentityInline';

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
      <UserIdentityInline
        name={nickname}
        avatarSrc={profileSrc}
        avatarAlt="멤버 프로필 이미지"
        size="md"
      />
      <Link
        href="/dashboard/profile/edit"
        className={styles.settingsButton}
        aria-label="정보 변경">
        <SettingsIcon className={styles.settingsIcon} />
      </Link>
    </div>
  );
}
