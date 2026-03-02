'use client';

import Link from 'next/link';
import { memo } from 'react';

import AppointmentPlaceMeta from '@/components/ui/AppointmentPlaceMeta';
import DateTimeMetaRow from '@/components/ui/DateTimeMetaRow';
import IconLabel from '@/components/ui/IconLabel';
import UserIdentityInline from '@/components/ui/UserIdentityInline';
import { getEffectiveAppointmentStatus } from '@/utils/appointmentStatus';

import * as styles from './AppointmentCard.css';

interface AppointmentCardProps {
  appointment: import('@/actions/appointment').AppointmentListItem;
}

const STATUS_LABELS: Record<
  ReturnType<typeof getEffectiveAppointmentStatus>,
  string
> = {
  pending: '모집중',
  canceled: '약속취소',
  ended: '종료됨',
};

function getParticipationLabel(isOwner: boolean, isMember: boolean) {
  if (isOwner) return '내가 만든 약속';
  if (isMember) return '참여한 약속';
  return null;
}

export const AppointmentCard = memo(function AppointmentCard({
  appointment,
}: AppointmentCardProps) {
  const {
    appointmentId,
    title: appointmentTitle,
    status,
    startAt,
    endsAt,
    creatorNickname,
    creatorName,
    creatorProfileImage,
    place,
    memberCount: count,
    commentCount,
    isOwner,
    isMember,
  } = appointment;
  const effectiveStatus = getEffectiveAppointmentStatus(status, endsAt);

  const displayName = creatorNickname || creatorName || '알 수 없음';
  const participationLabel = getParticipationLabel(isOwner, isMember);

  return (
    <Link
      href={`/dashboard/appointments/${appointmentId}`}
      className={styles.card}
      aria-label={`${appointmentTitle} 약속 상세 페이지로 이동`}>
      <div className={styles.cardHeader}>
        <div className={styles.headerMain}>
          <div className={styles.badgeRow}>
            <span className={styles.statusBadge[effectiveStatus]}>
              {STATUS_LABELS[effectiveStatus]}
            </span>
            {participationLabel ? (
              <span
                className={isOwner ? styles.createdBadge : styles.joinedBadge}>
                {participationLabel}
              </span>
            ) : null}
          </div>
          <h3 className={styles.title}>{appointmentTitle}</h3>
          <DateTimeMetaRow startAt={startAt} endsAt={endsAt} />
        </div>
      </div>

      <div className={styles.placeInfo}>
        <AppointmentPlaceMeta
          placeName={place.name}
          rating={null}
          reviewCount={0}
          category={place.category}
          showReviewCountWhenZero={false}
        />
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.statsInfo}>
          <IconLabel
            as="span"
            icon="group"
            count={<span className={styles.memberCount}>{count}명</span>}
          />
          <IconLabel
            as="span"
            icon="comment"
            count={<span className={styles.commentCount}>{commentCount}</span>}
          />
        </div>
        <div className={styles.participantInfo}>
          <UserIdentityInline
            name={displayName}
            avatarSrc={creatorProfileImage}
            avatarAlt="작성자 프로필 이미지"
            size="sm"
            me={isOwner}
          />
        </div>
      </div>
    </Link>
  );
});
