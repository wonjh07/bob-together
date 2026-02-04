import Link from 'next/link';

import GroupInvitationClient from './GroupInvitationClient';
import {
  invitationPage,
  invitationPanel,
  headerRow,
  headerTitle,
  actionLink,
  headerMeta,
} from './page.css';

type GroupInvitationPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function GroupInvitationPage({
  searchParams,
}: GroupInvitationPageProps) {
  const groupId =
    typeof searchParams?.groupId === 'string' ? searchParams.groupId : '';
  const groupName =
    typeof searchParams?.groupName === 'string' ? searchParams.groupName : '';

  const completeHref = groupId
    ? `/group/invitation/complete?groupId=${groupId}&groupName=${encodeURIComponent(
        groupName,
      )}`
    : '/group/invitation/complete';

  return (
    <div className={invitationPage}>
      <div className={invitationPanel}>
        <div className={headerRow}>
          <div>
            <div className={headerTitle}>새 멤버를 초대해주세요</div>
            {groupName && <div className={headerMeta}>{groupName}</div>}
          </div>
          <Link href={completeHref} className={actionLink}>
            완료
          </Link>
        </div>
        <GroupInvitationClient groupId={groupId} />
      </div>
    </div>
  );
}
