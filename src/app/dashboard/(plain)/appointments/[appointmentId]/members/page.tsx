import Image from 'next/image';

import { getAppointmentMembersAction } from '@/actions/appointment';
import GroupIcon from '@/components/icons/GroupIcon';

import AppointmentMembersTopNav from './_components/AppointmentMembersTopNav';
import * as styles from './page.css';

type AppointmentMembersPageProps = {
  params: {
    appointmentId: string;
  };
};

export default async function AppointmentMembersPage({
  params,
}: AppointmentMembersPageProps) {
  const result = await getAppointmentMembersAction(params.appointmentId);

  if (!result.ok || !result.data) {
    return (
      <div className={styles.page}>
        <AppointmentMembersTopNav />
        <div className={styles.errorBox}>
          {result.ok
            ? '약속 멤버 정보를 불러올 수 없습니다.'
            : result.message || '약속 멤버 정보를 불러올 수 없습니다.'}
        </div>
      </div>
    );
  }

  const data = result.data;

  return (
    <div className={styles.page}>
      <AppointmentMembersTopNav />

      <div className={styles.content}>
        <div className={styles.caption}>
          <span>멤버</span>
          <GroupIcon className={styles.captionIcon} />
          <span>{data.memberCount}</span>
        </div>

        <div className={styles.list}>
          {data.members.map((member) => {
            const displayNickname =
              member.nickname || member.name || '알 수 없음';
            const displayName = member.name || member.nickname || '-';

            return (
              <div key={member.userId} className={styles.card}>
                <div className={styles.cardInfo}>
                  <Image
                    src={member.profileImage || '/profileImage.png'}
                    alt="멤버 프로필 이미지"
                    width={56}
                    height={56}
                    className={styles.avatar}
                  />
                  <div className={styles.names}>
                    <div className={styles.nicknameRow}>
                      <p className={styles.nickname}>{displayNickname}</p>
                      {member.userId === data.currentUserId ? (
                        <span className={styles.meText}>me</span>
                      ) : null}
                    </div>
                    <p className={styles.name}>{displayName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.moreButton}
                  aria-label="멤버 메뉴">
                  ⋮
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
