'use client';

import IconLabel from '@/components/ui/IconLabel';
import OverflowMenu from '@/components/ui/OverflowMenu';
import UserIdentityInline from '@/components/ui/UserIdentityInline';
import { formatDateDot } from '@/utils/dateFormat';

import * as styles from './GroupManageCard.css';

type GroupItem = {
  groupId: string;
  groupName: string;
  ownerName: string | null;
  ownerNickname: string | null;
  ownerProfileImage: string | null;
  joinedAt: string;
  createdAt: string;
  memberCount: number;
  isOwner: boolean;
};

interface GroupManageCardProps {
  group: GroupItem;
  isMenuOpen: boolean;
  isLeaving: boolean;
  onToggleMenu: (groupId: string) => void;
  onCloseMenu: () => void;
  onLeaveGroup: (groupId: string) => void;
}

export default function GroupManageCard({
  group,
  isMenuOpen,
  isLeaving,
  onToggleMenu,
  onCloseMenu,
  onLeaveGroup,
}: GroupManageCardProps) {
  const ownerDisplayName =
    group.ownerNickname || group.ownerName || '알 수 없음';
  const label = group.isOwner ? '생성일' : '가입일';
  const dateText = group.isOwner
    ? formatDateDot(group.createdAt)
    : formatDateDot(group.joinedAt);
  const menuItems = group.isOwner
    ? [
        {
          key: 'manage-members',
          label: '멤버 관리',
          href: `/dashboard/profile/groups/${group.groupId}/members`,
        },
      ]
    : [
        {
          key: 'leave',
          label: isLeaving ? '탈퇴 중...' : '그룹 탈퇴',
          danger: true,
          onClick: () => onLeaveGroup(group.groupId),
        },
      ];

  return (
    <article className={styles.card}>
      <div className={styles.headRow}>
        <UserIdentityInline
          name={ownerDisplayName}
          avatarSrc={group.ownerProfileImage}
          avatarAlt={`${ownerDisplayName} 프로필`}
          size="sm"
          me={group.isOwner}
        />
        <OverflowMenu
          isOpen={isMenuOpen}
          isDisabled={isLeaving}
          ariaLabel="그룹 메뉴"
          onToggle={() => onToggleMenu(group.groupId)}
          onClose={onCloseMenu}
          items={menuItems}
        />
      </div>
      <h2 className={styles.groupName}>{group.groupName}</h2>
      <div className={styles.footerRow}>
        <span className={styles.dateText}>
          {label}: {dateText}
        </span>
        <span className={styles.memberMeta}>
          <IconLabel as="span" icon="group" count={group.memberCount} />
        </span>
      </div>
    </article>
  );
}
