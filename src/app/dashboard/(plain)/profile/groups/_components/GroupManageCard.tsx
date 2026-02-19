'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import GroupIcon from '@/components/icons/GroupIcon';

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

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

export default function GroupManageCard({
  group,
  isMenuOpen,
  isLeaving,
  onToggleMenu,
  onCloseMenu,
  onLeaveGroup,
}: GroupManageCardProps) {
  const menuWrapRef = useRef<HTMLDivElement | null>(null);
  const ownerDisplayName =
    group.ownerNickname || group.ownerName || '알 수 없음';
  const label = group.isOwner ? '생성일' : '가입일';
  const dateText = group.isOwner
    ? formatDate(group.createdAt)
    : formatDate(group.joinedAt);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuWrapRef.current?.contains(target)) return;
      onCloseMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isMenuOpen, onCloseMenu]);

  return (
    <article className={styles.card}>
      <div className={styles.headRow}>
        <h2 className={styles.groupName}>{group.groupName}</h2>
        <div ref={menuWrapRef} className={styles.menuWrap}>
          <button
            type="button"
            className={styles.moreButton}
            onClick={() => onToggleMenu(group.groupId)}
            aria-label="그룹 메뉴"
            disabled={isLeaving}>
            ⋮
          </button>
          {isMenuOpen ? (
            <div className={styles.dropdown}>
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => onLeaveGroup(group.groupId)}
                disabled={isLeaving}>
                {isLeaving ? '탈퇴 중...' : '그룹 탈퇴'}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.ownerRow}>
        <Image
          src={group.ownerProfileImage || '/profileImage.png'}
          alt={`${ownerDisplayName} 프로필`}
          width={42}
          height={42}
          className={styles.avatar}
        />
        <div className={styles.ownerNameRow}>
          <span className={styles.ownerName}>{ownerDisplayName}</span>
          {group.isOwner ? <span className={styles.meText}>me</span> : null}
        </div>
      </div>

      <div className={styles.footerRow}>
        <span className={styles.dateText}>
          {label}: {dateText}
        </span>
        <span className={styles.memberMeta}>
          <GroupIcon width="20" height="20" />
          <a>{group.memberCount}</a>
        </span>
      </div>
    </article>
  );
}
