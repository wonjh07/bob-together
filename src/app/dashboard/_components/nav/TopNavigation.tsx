'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

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

const PENDING_INVITATION_TOAST_ID = 'pending-invitation-alert';

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
  const hasShownPendingToastRef = useRef(false);

  const { data: hasPendingInvitations = false } = useQuery({
    ...createHasPendingInvitationsQueryOptions(queryScope),
    enabled: Boolean(userId),
  });
  const hasNewNotification = hasPendingInvitations;

  useEffect(() => {
    if (!hasPendingInvitations) {
      hasShownPendingToastRef.current = false;
      toast.dismiss(PENDING_INVITATION_TOAST_ID);
      return;
    }

    if (hasShownPendingToastRef.current) {
      return;
    }

    toast.error('새로운 알림이 있습니다.', {
      id: PENDING_INVITATION_TOAST_ID,
    });
    hasShownPendingToastRef.current = true;
  }, [hasPendingInvitations]);

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
