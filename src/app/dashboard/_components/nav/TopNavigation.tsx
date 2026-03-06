'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import BellIcon from '@/components/icons/BellIcon';
import { createInvitationIndicatorQueryOptions } from '@/libs/query/invitationQueries';
import { useQueryScope } from '@/provider/query-scope-provider';

import {
  topNav,
  logoSection,
  navRight,
  notificationLinkWrap,
  iconButton,
  bellIcon,
  bellIconUnread,
  notificationBubble,
  menuButton,
  menuIcon,
} from './TopNavigation.css';
import { ProfileDropdown } from './ui/ProfileDrop';

function extractUserIdFromScope(scope: string) {
  if (!scope.startsWith('user:')) {
    return null;
  }

  const userId = scope.slice('user:'.length);
  return userId || null;
}

export function TopNav() {
  const queryScope = useQueryScope();
  const userId = extractUserIdFromScope(queryScope);

  const { data: hasUnreadInvitations = false } = useQuery({
    ...createInvitationIndicatorQueryOptions(queryScope),
    enabled: Boolean(userId),
  });
  const hasNewNotification = hasUnreadInvitations;

  return (
    <header className={topNav}>
      <div className={logoSection}>
        <span>밥투게더</span>
      </div>

      <div className={navRight}>
        <div className={notificationLinkWrap}>
          <Link
            href="/dashboard/notifications"
            className={iconButton}
            aria-label="알림 페이지로 이동">
            <BellIcon
              variant={hasNewNotification ? 'new' : 'default'}
              className={`${bellIcon} ${hasNewNotification ? bellIconUnread : ''}`}
            />
          </Link>
          {hasNewNotification ? (
            <span className={notificationBubble} aria-hidden="true">
              새 초대가 도착했어요
            </span>
          ) : null}
        </div>
        <ProfileDropdown
          triggerClassName={menuButton}
          triggerIconClassName={menuIcon}
        />
      </div>
    </header>
  );
}
