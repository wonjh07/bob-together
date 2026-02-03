'use client';

import {
  card,
  cardHeader,
  titleRow,
  title,
  statusBadge,
  editButton,
  placeInfo,
  placeName,
  placeDetail,
  categoryTag,
  dateTimeInfo,
  dateTimeItem,
  icon,
  cardFooter,
  participantInfo,
  meBadge,
  hostName,
  memberCount,
} from './AppointmentCard.css';

import type { AppointmentListItem } from '@/actions/appointment';

interface AppointmentCardProps {
  appointment: AppointmentListItem;
  onEdit?: (appointmentId: string) => void;
}

const STATUS_LABELS: Record<AppointmentListItem['status'], string> = {
  confirmed: '약속확정',
  pending: '모집중',
  canceled: '약속취소',
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  return `${period} ${displayHours}:${minutes}`;
}

function formatTimeRange(startAt: string, endsAt: string): string {
  return `${formatTime(startAt)} - ${formatTime(endsAt)}`;
}

export function AppointmentCard({ appointment, onEdit }: AppointmentCardProps) {
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
    isOwner,
    isMember,
  } = appointment;

  const displayName = creatorNickname || creatorName || '알 수 없음';

  return (
    <div className={card}>
      <div className={cardHeader}>
        <div className={titleRow}>
          <h3 className={title}>{appointmentTitle}</h3>
          <span className={statusBadge[status]}>{STATUS_LABELS[status]}</span>
        </div>
        {isOwner && (
          <button
            type="button"
            className={editButton}
            onClick={() => onEdit?.(appointmentId)}>
            수정
          </button>
        )}
      </div>

      <div className={placeInfo}>
        <div className={placeName}>{place.name}</div>
        <div className={placeDetail}>
          <span>{place.address}</span>
          {place.category && (
            <span className={categoryTag}>{place.category}</span>
          )}
        </div>
      </div>

      <div className={dateTimeInfo}>
        <div className={dateTimeItem}>
          <svg
            className={icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formatDate(startAt)}</span>
        </div>
        <div className={dateTimeItem}>
          <svg
            className={icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{formatTimeRange(startAt, endsAt)}</span>
        </div>
      </div>

      <div className={cardFooter}>
        <div className={participantInfo}>
          {isMember && <span className={meBadge}>me</span>}
          <span className={hostName}>{displayName}</span>
        </div>
        <span className={memberCount}>{count}명 참여</span>
      </div>
    </div>
  );
}
