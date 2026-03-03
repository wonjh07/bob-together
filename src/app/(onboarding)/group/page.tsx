import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getMyGroupsAction } from '@/actions/group';
import GroupIcon from '@/components/icons/GroupIcon';

import * as styles from './page.css';

export default async function GroupEntryPage() {
  const groupResult = await getMyGroupsAction();
  const groups = groupResult.ok && groupResult.data ? groupResult.data.groups : [];

  if (groupResult.ok && groups.length > 0) {
    redirect('/dashboard');
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.iconWrap}>
          <GroupIcon />
        </div>
        <div className={styles.entryTitle}>아직 가입한 그룹이 없으시네요</div>
        <div className={styles.serviceTitle}>밥투게더</div>
        <div className={styles.entryDescription}>
          서비스를 이용하려면
          <br />
          하나 이상의 그룹에 가입해야해요
        </div>
        <div className={styles.buttonStack}>
          <Link
            href="/dashboard/profile/groups/find"
            replace
            className={`${styles.buttonBase} ${styles.primaryButton} ${styles.linkButton}`}>
            그룹 가입하기
          </Link>
          <Link
            href="/dashboard/profile/groups/create?from=onboarding"
            replace
            className={`${styles.buttonBase} ${styles.secondaryButton} ${styles.linkButton}`}>
            그룹 생성하기
          </Link>
        </div>
      </div>
    </div>
  );
}
