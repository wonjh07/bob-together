'use client';

import Link from 'next/link';

import AppointmentPlaceMeta from '@/components/ui/AppointmentPlaceMeta';
import UserIdentityInline from '@/components/ui/UserIdentityInline';
import { formatDateDot } from '@/utils/dateFormat';

import * as styles from './HistoryAppointmentCard.css';

import type { AppointmentHistoryItem } from '@/actions/appointment';

interface HistoryAppointmentCardProps {
  appointment: AppointmentHistoryItem;
}

export default function HistoryAppointmentCard({
  appointment,
}: HistoryAppointmentCardProps) {
  const creatorLabel =
    appointment.creatorNickname || appointment.creatorName || '알 수 없음';

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <p className={styles.date}>{formatDateDot(appointment.startAt)}</p>
        <div className={styles.creatorMeta}>
          <UserIdentityInline
            name={creatorLabel}
            avatarSrc={appointment.creatorProfileImage}
            avatarAlt={`${creatorLabel} 프로필`}
            size="sm"
          />
        </div>
      </div>

      <AppointmentPlaceMeta
        title={appointment.title}
        placeName={appointment.place.name}
        placeHref={`/dashboard/places/${appointment.place.placeId}`}
        rating={appointment.place.reviewAverage}
        reviewCount={appointment.place.reviewCount}
        category={appointment.place.category}
      />

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
