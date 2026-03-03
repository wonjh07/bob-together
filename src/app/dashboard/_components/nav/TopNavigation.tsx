'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import BellIcon from '@/components/icons/BellIcon';
import { createHasPendingInvitationsQueryOptions } from '@/libs/query/invitationQueries';
import { useQueryScope } from '@/provider/query-scope-provider';

import {
  topNav,
  logoSection,
  navRight,
  iconButton,
  bellIcon,
  bellIconActive,
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

  const { data: hasPendingInvitations = false } = useQuery({
    ...createHasPendingInvitationsQueryOptions(queryScope),
    enabled: Boolean(userId),
  });
  const hasNewNotification = hasPendingInvitations;

  return (
    <header className={topNav}>
      <div className={logoSection}>
        <span>밥투게더</span>
      </div>

      <div className={navRight}>
        <Link
          href="/dashboard/notifications"
          className={iconButton}
          aria-label="알림 페이지로 이동">
          <BellIcon
            variant={hasNewNotification ? 'new' : 'default'}
            className={`${bellIcon} ${hasNewNotification ? bellIconActive : ''}`}
          />
        </Link>
        <ProfileDropdown
          triggerClassName={menuButton}
          triggerIconClassName={menuIcon}
        />
      </div>
    </header>
  );
}
