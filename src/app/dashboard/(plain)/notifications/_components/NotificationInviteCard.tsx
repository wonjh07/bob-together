'use client';

import Image from 'next/image';
import Link from 'next/link';

import CalendarIcon from '@/components/icons/CalendarIcon';
import GroupIcon from '@/components/icons/GroupIcon';
import PaperPlaneIcon from '@/components/icons/PaperPlaneIcon';

import * as styles from './NotificationInviteCard.css';

import type { InvitationListItem } from '@/actions/invitation';

interface NotificationInviteCardProps {
  invitation: InvitationListItem;
  isProcessing: boolean;
  onAccept: (invitationId: string) => void;
  onReject: (invitationId: string) => void;
}

function formatRelative(createdAt: string): string {
  const created = new Date(createdAt);
  const diff = Date.now() - created.getTime();

  if (Number.isNaN(created.getTime()) || diff < 0) {
    return '';
  }

  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) {
    return `${Math.max(1, minutes)}분전`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}시간전`;
  }

  const days = Math.floor(hours / 24);
  return `${days}일전`;
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
  const relativeText = formatRelative(invitation.createdTime);
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
        <Link href={appointmentHref} className={`${styles.messageRow} ${styles.messageLink}`}>
          <CalendarIcon className={styles.messageIcon} />
          <p className={styles.message}>
            <strong>{`“${targetTitle}”`}</strong> 약속에 초대받았어요.
          </p>
        </Link>
      ) : (
        <div className={styles.messageRow}>
          {isAppointmentInvite ? (
            <CalendarIcon className={styles.messageIcon} />
          ) : (
            <GroupIcon className={styles.messageIcon} />
          )}
          <p className={styles.message}>
            <strong>{`“${targetTitle}”`}</strong>{' '}
            {isAppointmentInvite ? '약속에 초대받았어요.' : '그룹에 초대받았어요.'}
          </p>
        </div>
      )}

      <div className={styles.metaRow}>
        <Image
          src={invitation.inviterProfileImage || '/profileImage.png'}
          alt={`${inviterDisplayName} 프로필`}
          width={30}
          height={30}
          className={styles.avatar}
        />
        <span className={styles.metaText}>
          {inviterDisplayName}
          {relativeText ? ` · ${relativeText}` : ''}
        </span>
      </div>

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
