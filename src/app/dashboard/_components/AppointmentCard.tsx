'use client';

import CommentIcon from '@/components/icons/CommentIcon';
import GroupIcon from '@/components/icons/GroupIcon';
import DateTimeMetaRow from '@/components/ui/DateTimeMetaRow';
import IconLabel from '@/components/ui/IconLabel';
import { getEffectiveAppointmentStatus } from '@/utils/appointmentStatus';
import {
  formatDateKoreanWithWeekday,
  formatTimeRangeKoreanMeridiem,
} from '@/utils/dateFormat';

import * as styles from './AppointmentCard.css';

interface AppointmentCardProps {
  appointment: import('@/actions/appointment').AppointmentListItem;
  onDetail?: (appointmentId: string) => void;
}

const STATUS_LABELS: Record<
  ReturnType<typeof getEffectiveAppointmentStatus>,
  string
> = {
  pending: '모집중',
  canceled: '약속취소',
  ended: '종료됨',
};

export function AppointmentCard({
  appointment,
  onDetail,
}: AppointmentCardProps) {
  const {
    appointmentId,
    title: appointmentTitle,
    status,
    startAt,
    endsAt,
    creatorNickname,
    creatorName,
    place,
    memberCount: count,
    commentCount,
    isOwner,
    isMember,
  } = appointment;
  const effectiveStatus = getEffectiveAppointmentStatus(status, endsAt);

  const displayName = creatorNickname || creatorName || '알 수 없음';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerMain}>
          <div className={styles.badgeRow}>
            <span className={styles.statusBadge[effectiveStatus]}>
              {STATUS_LABELS[effectiveStatus]}
            </span>
            {isOwner ? (
              <span className={styles.createdBadge}>내가 만든 약속</span>
            ) : isMember ? (
              <span className={styles.joinedBadge}>참여한 약속</span>
            ) : null}
          </div>
          <h3 className={styles.title}>{appointmentTitle}</h3>
        </div>
        <button
          type="button"
          className={styles.editButton}
          onClick={() => onDetail?.(appointmentId)}>
          상세보기
        </button>
      </div>

      <div className={styles.placeInfo}>
        <div className={styles.placeName}>{place.name}</div>
        <div className={styles.placeDetail}>
          <span>{place.address}</span>
          {place.category && (
            <span className={styles.categoryTag}>{place.category}</span>
          )}
        </div>
      </div>

      <DateTimeMetaRow
        date={formatDateKoreanWithWeekday(startAt)}
        timeRange={formatTimeRangeKoreanMeridiem(startAt, endsAt)}
        rowClassName={styles.dateTimeInfo}
        itemClassName={styles.dateTimeItem}
        iconClassName={styles.icon}
        dateIconSize={16}
        timeIconSize={16}
      />

      <div className={styles.cardFooter}>
        <div className={styles.statsInfo}>
          <IconLabel
            as="span"
            className={styles.memberInfo}
            icon={<GroupIcon className={styles.memberIcon} />}>
            <span className={styles.memberCount}>{count}명</span>
          </IconLabel>
          <IconLabel
            as="span"
            className={styles.commentInfo}
            icon={<CommentIcon className={styles.commentIcon} />}>
            <span className={styles.commentCount}>{commentCount}</span>
          </IconLabel>
        </div>
        <div className={styles.participantInfo}>
          {isOwner && <span className={styles.meBadge}>me</span>}
          <span className={styles.hostName}>{displayName}</span>
        </div>
      </div>
    </div>
  );
}
