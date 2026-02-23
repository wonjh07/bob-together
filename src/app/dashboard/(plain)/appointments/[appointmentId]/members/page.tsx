import { getAppointmentMembersAction } from '@/actions/appointment';
import GroupIcon from '@/components/icons/GroupIcon';
import IconLabel from '@/components/ui/IconLabel';
import UserIdentityInline from '@/components/ui/UserIdentityInline';

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
          <IconLabel
            as="span"
            className={styles.captionCount}
            icon={<GroupIcon className={styles.captionIcon} />}>
            <span>{data.memberCount}</span>
          </IconLabel>
        </div>

        <div className={styles.list}>
          {data.members.map((member) => {
            const displayNickname =
              member.nickname || member.name || '알 수 없음';
            const displayName = member.name || member.nickname || '-';

            return (
              <div key={member.userId} className={styles.card}>
                <UserIdentityInline
                  name={displayNickname}
                  subtitle={displayName}
                  avatarSrc={member.profileImage}
                  avatarAlt="멤버 프로필 이미지"
                  avatarSize="xl"
                  me={member.userId === data.currentUserId}
                  rowClassName={styles.cardInfo}
                  avatarClassName={styles.avatar}
                  textWrapClassName={styles.names}
                  nameRowClassName={styles.nicknameRow}
                  nameClassName={styles.nickname}
                  meClassName={styles.meText}
                  subtitleClassName={styles.name}
                />
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
