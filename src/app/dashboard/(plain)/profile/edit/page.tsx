import { getUserData } from '@/actions/user';

import * as styles from './page.css';
import ProfileEditClient from './ProfileEditClient';

export default async function EditPage() {
  const result = await getUserData();
  const user = result.ok && result.data ? result.data : null;

  return (
    <div className={styles.page}>
      <ProfileEditClient
        initialName={user?.name ?? ''}
        initialNickname={user?.nickname ?? ''}
        initialProfileImage={user?.profileImage ?? null}
      />
    </div>
  );
}
