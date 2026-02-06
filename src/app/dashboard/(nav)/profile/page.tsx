import { getUserData } from '@/actions/user';

import { ProfileQuickLinks } from './_components/ProfileQuickLinks';
import { ProfileSummary } from './_components/ProfileSummary';
import * as styles from './page.css';

export default async function ProfilePage() {
  const result = await getUserData();
  const user = result.ok && result.data ? result.data : null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>내정보</h1>
      </div>
      <div className={styles.content}>
        <ProfileSummary
          nickname={user?.nickname ?? user?.name ?? '사용자'}
          profileImage={user?.profileImage ?? null}
        />
        <ProfileQuickLinks />
      </div>
    </div>
  );
}
