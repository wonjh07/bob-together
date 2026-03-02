import { getAppointmentMembersAction } from '@/actions/appointment';
import IconLabel from '@/components/ui/IconLabel';
import PlainTopNav from '@/components/ui/PlainTopNav';
import RequestErrorModal from '@/components/ui/RequestErrorModal';
import UserIdentityInline from '@/components/ui/UserIdentityInline';

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
        <PlainTopNav title="약속 멤버" rightHidden />
        <RequestErrorModal
          isOpen
          message={
            result.ok
              ? '약속 멤버 정보를 불러올 수 없습니다.'
              : result.message || '약속 멤버 정보를 불러올 수 없습니다.'
          }
        />
      </div>
    );
  }

  const data = result.data;
  const isCurrentUserOwner = data.members.some(
    (member) =>
      member.userId === data.currentUserId
      && member.role === 'owner',
  );
  const invitationHref = `/dashboard/appointments/invitation?appointmentId=${params.appointmentId}`;

  return (
    <div className={styles.page}>
      <PlainTopNav
        title="약속 멤버"
        rightLabel="멤버 초대"
        rightHref={invitationHref}
        rightHidden={!isCurrentUserOwner}
      />

      <div className={styles.content}>
        <div className={styles.caption}>
          <span>멤버</span>
          <span className={styles.captionCount}>
            <IconLabel as="span" icon="group" count={data.memberCount} />
          </span>
        </div>

        <div className={styles.list}>
          {data.members.map((member) => {
            const displayNickname =
              member.nickname || member.name || '알 수 없음';
            const displayName = member.name || member.nickname || '-';

            return (
              <div key={member.userId} className={styles.card}>
                <div className={styles.cardInfo}>
                  <UserIdentityInline
                    name={displayNickname}
                    subtitle={displayName}
                    avatarSrc={member.profileImage}
                    avatarAlt="멤버 프로필 이미지"
                    size="lg"
                    me={member.userId === data.currentUserId}
                  />
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
