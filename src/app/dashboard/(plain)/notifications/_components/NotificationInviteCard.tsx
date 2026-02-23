'use client';

import Link from 'next/link';

import CalendarIcon from '@/components/icons/CalendarIcon';
import GroupIcon from '@/components/icons/GroupIcon';
import PaperPlaneIcon from '@/components/icons/PaperPlaneIcon';
import IconLabel from '@/components/ui/IconLabel';
import UserIdentityInline from '@/components/ui/UserIdentityInline';
import { formatRelativeKorean } from '@/utils/dateFormat';

import * as styles from './NotificationInviteCard.css';

import type { InvitationListItem } from '@/actions/invitation';

interface NotificationInviteCardProps {
  invitation: InvitationListItem;
  isProcessing: boolean;
  onAccept: (invitationId: string) => void;
  onReject: (invitationId: string) => void;
}

function isEndedAppointment(endsAt: string | null): boolean {
  if (!endsAt) return false;
  const time = new Date(endsAt).getTime();
  if (Number.isNaN(time)) return false;
  return time <= Date.now();
}

export default function NotificationInviteCard({
  invitation,
  isProcessing,
  onAccept,
  onReject,
}: NotificationInviteCardProps) {
  const inviterDisplayName =
    invitation.inviterNickname || invitation.inviterName || '알 수 없음';
  const relativeText = formatRelativeKorean(invitation.createdTime);
  const isAppointmentInvite = invitation.type === 'appointment';
  const isEnded = isAppointmentInvite
    ? isEndedAppointment(invitation.appointmentEndsAt)
    : false;
  const respondedLabel =
    invitation.status === 'accepted'
      ? '초대 수락'
      : invitation.status === 'rejected'
        ? '초대 거절'
        : null;
  const targetTitle = isAppointmentInvite
    ? invitation.appointmentTitle || '약속'
    : invitation.groupName || '그룹';
  const appointmentHref =
    isAppointmentInvite && invitation.appointmentId
      ? `/dashboard/appointments/${invitation.appointmentId}`
      : null;

  return (
    <article className={styles.card}>
      <div className={styles.typeRow}>
        <div className={styles.typeLabel}>
          <PaperPlaneIcon className={styles.typeIcon} />
          <span>{isAppointmentInvite ? '약속 초대' : '그룹 초대'}</span>
        </div>
      </div>

      {appointmentHref ? (
        <Link href={appointmentHref} className={styles.messageLink}>
          <IconLabel
            className={styles.messageRow}
            icon={<CalendarIcon className={styles.messageIcon} />}>
            <p className={styles.message}>
              <strong>{`“${targetTitle}”`}</strong> 약속에 초대받았어요.
            </p>
          </IconLabel>
        </Link>
      ) : (
        <IconLabel
          className={styles.messageRow}
          icon={
            isAppointmentInvite ? (
              <CalendarIcon className={styles.messageIcon} />
            ) : (
              <GroupIcon className={styles.messageIcon} />
            )
          }>
          <p className={styles.message}>
            <strong>{`“${targetTitle}”`}</strong>{' '}
            {isAppointmentInvite ? '약속에 초대받았어요.' : '그룹에 초대받았어요.'}
          </p>
        </IconLabel>
      )}

      <UserIdentityInline
        name={`${inviterDisplayName}${relativeText ? ` · ${relativeText}` : ''}`}
        avatarSrc={invitation.inviterProfileImage}
        avatarAlt={`${inviterDisplayName} 프로필`}
        avatarSize="sm"
        rowClassName={styles.metaRow}
        avatarClassName={styles.avatar}
        nameClassName={styles.metaText}
      />

      {respondedLabel ? (
        <p
          className={`${styles.statusText} ${
            invitation.status === 'accepted'
              ? styles.acceptedStatus
              : styles.rejectedStatus
          }`}>
          {respondedLabel}
        </p>
      ) : isEnded ? (
        <p className={styles.endedText}>종료된 약속입니다</p>
      ) : (
        <div className={styles.actionRow}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.acceptButton}`}
            onClick={() => onAccept(invitation.invitationId)}
            disabled={isProcessing}>
            {isProcessing ? '처리 중...' : '수락하기'}
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.rejectButton}`}
            onClick={() => onReject(invitation.invitationId)}
            disabled={isProcessing}>
            거절하기
          </button>
        </div>
      )}
    </article>
  );
}
