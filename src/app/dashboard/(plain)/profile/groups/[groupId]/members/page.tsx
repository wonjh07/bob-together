import { getGroupMembersAction } from '@/actions/group';
import IconLabel from '@/components/ui/IconLabel';
import PlainTopNav from '@/components/ui/PlainTopNav';
import RequestErrorModal from '@/components/ui/RequestErrorModal';
import UserIdentityInline from '@/components/ui/UserIdentityInline';

import * as styles from './page.css';

type GroupMembersPageProps = {
  params: {
    groupId: string;
  };
  searchParams?: {
    from?: string;
  };
};

export default async function GroupMembersPage({
  params,
  searchParams,
}: GroupMembersPageProps) {
  const result = await getGroupMembersAction(params.groupId);
  const fromOnboarding = searchParams?.from === 'onboarding';
  const backHref = fromOnboarding ? '/dashboard' : '/dashboard/profile/groups';

  if (!result.ok || !result.data) {
    return (
      <div className={styles.page}>
        <PlainTopNav
          title="그룹 멤버"
          backHref={backHref}
          backBehavior={fromOnboarding ? 'href' : 'auto'}
          rightLabel="멤버 초대"
          rightHref={`/dashboard/profile/groups/${params.groupId}/members/invitation`}
          rightAriaLabel="멤버 초대하기"
        />
        <RequestErrorModal
          isOpen
          message={
            result.ok
              ? '그룹 멤버 정보를 불러올 수 없습니다.'
              : result.message || '그룹 멤버 정보를 불러올 수 없습니다.'
          }
        />
      </div>
    );
  }

  const data = result.data;

  return (
    <div className={styles.page}>
      <PlainTopNav
        title="그룹 멤버"
        backHref={backHref}
        backBehavior={fromOnboarding ? 'href' : 'auto'}
        rightLabel="멤버 초대"
        rightHref={`/dashboard/profile/groups/${params.groupId}/members/invitation`}
        rightAriaLabel="멤버 초대하기"
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
