'use client';

import Image from 'next/image';
import Link from 'next/link';

import * as styles from './HistoryAppointmentCard.css';

import type { AppointmentHistoryItem } from '@/actions/appointment';

interface HistoryAppointmentCardProps {
  appointment: AppointmentHistoryItem;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function parseDistrict(address: string): string {
  if (!address) return '';
  const parts = address.split(' ');
  return parts.find((part) => part.endsWith('동') || part.endsWith('구')) || '';
}

export default function HistoryAppointmentCard({
  appointment,
}: HistoryAppointmentCardProps) {
  const creatorLabel =
    appointment.creatorNickname || appointment.creatorName || '알 수 없음';
  const reviewAverageText =
    appointment.place.reviewAverage !== null
      ? appointment.place.reviewAverage.toFixed(1)
      : '-';
  const district = parseDistrict(appointment.place.address);

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <p className={styles.date}>{formatDate(appointment.startAt)}</p>
        <div className={styles.creatorMeta}>
          <Image
            src={appointment.creatorProfileImage || '/profileImage.png'}
            alt={`${creatorLabel} 프로필`}
            width={36}
            height={36}
            className={styles.creatorAvatar}
          />
          <span className={styles.creatorName}>{creatorLabel}</span>
        </div>
      </div>

      <h2 className={styles.title}>{appointment.title}</h2>

      <p className={styles.placeName}>{appointment.place.name}</p>
      <p className={styles.placeMeta}>
        <span className={styles.star}>★</span>
        <span>
          {reviewAverageText} ({appointment.place.reviewCount})
        </span>
        {district ? <span>· {district}</span> : null}
        {appointment.place.category ? <span>· {appointment.place.category}</span> : null}
      </p>

      <div className={styles.buttonRow}>
        <Link
          href={`/dashboard/appointments/${appointment.appointmentId}`}
          className={styles.detailButton}>
          상세보기
        </Link>
        <Link
          href={`/dashboard/profile/reviews/${appointment.appointmentId}`}
          className={styles.reviewButton}>
          {appointment.canWriteReview ? '리뷰 남기기' : '리뷰 수정하기'}
        </Link>
      </div>
    </article>
  );
}
