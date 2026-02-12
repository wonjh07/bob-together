'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';

import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import GroupIcon from '@/components/icons/GroupIcon';
import { KakaoMapPreview } from '@/components/kakao/KakaoMapPreview';
import {
  createAppointmentDetailQueryOptions,
} from '@/libs/query/appointmentQueries';

import AppointmentCommentsSection from './_components/AppointmentCommentsSection';
import AppointmentDetailActions from './_components/AppointmentDetailActions';
import AppointmentDetailTopNav from './_components/AppointmentDetailTopNav';
import * as styles from './page.css';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
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

function parseDistrict(address: string): string {
  const parts = address.split(' ');
  return parts.find((part) => part.endsWith('동') || part.endsWith('구')) || '';
}

interface AppointmentDetailClientProps {
  appointmentId: string;
}

export default function AppointmentDetailClient({
  appointmentId,
}: AppointmentDetailClientProps) {
  const detailQuery = useQuery(createAppointmentDetailQueryOptions(appointmentId));

  if (detailQuery.isLoading) {
    return (
      <div className={styles.page}>
        <AppointmentDetailTopNav appointmentId={appointmentId} canEdit={false} />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className={styles.page}>
        <AppointmentDetailTopNav appointmentId={appointmentId} canEdit={false} />
        <div className={styles.errorBox}>
          {detailQuery.error instanceof Error
            ? detailQuery.error.message
            : '약속 정보를 불러올 수 없습니다.'}
        </div>
      </div>
    );
  }

  const appointment = detailQuery.data.appointment;
  const createdLabel = formatRelative(appointment.createdAt);
  const displayName =
    appointment.creatorNickname || appointment.creatorName || '알 수 없음';
  const district = parseDistrict(appointment.place.address);

  const reviewAverageText =
    appointment.place.reviewAverage !== null
      ? appointment.place.reviewAverage.toFixed(1)
      : '-';

  return (
    <div className={styles.page}>
      <AppointmentDetailTopNav
        appointmentId={appointmentId}
        canEdit={appointment.isOwner}
      />
      <div className={styles.content}>
        <div>
          <div className={styles.authorRow}>
            <Image
              src={appointment.creatorProfileImage || '/profileImage.png'}
              alt="작성자 프로필 이미지"
              width={56}
              height={56}
              className={styles.authorAvatar}
              unoptimized
            />
            <div>
              <div className={styles.authorNameLine}>
                <span>{displayName}</span>
                {appointment.isOwner ? (
                  <span className={styles.meText}>me</span>
                ) : null}
              </div>
              <div className={styles.authorMeta}>
                {[appointment.creatorName, createdLabel]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
          </div>

          <h1 className={styles.appointmentTitle}>{appointment.title}</h1>

          <div className={styles.dateTimeRow}>
            <div className={styles.dateTimeItem}>
              <CalendarIcon className={styles.dateTimeIcon} />
              <span>{formatDate(appointment.startAt)}</span>
            </div>
            <div className={styles.dateTimeItem}>
              <ClockIcon className={styles.dateTimeIcon} />
              <span>
                {formatTime(appointment.startAt)}-
                {formatTime(appointment.endsAt)}
              </span>
            </div>
          </div>

          <div className={styles.placeSection}>
            <h2 className={styles.placeName}>{appointment.place.name}</h2>
            <div className={styles.placeMetaRow}>
              <span className={styles.star}>★</span>
              <span>
                {reviewAverageText} ({appointment.place.reviewCount})
              </span>
              {district ? <span>· {district}</span> : null}
              {appointment.place.category ? (
                <span>· {appointment.place.category}</span>
              ) : null}
            </div>
          </div>

          <div className={styles.mapWrapper}>
            <KakaoMapPreview
              latitude={appointment.place.latitude}
              longitude={appointment.place.longitude}
              title={appointment.place.name}
              address={appointment.place.address}
              isInteractive={false}
            />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.memberRow}>
            <div className={styles.memberInfo}>
              <GroupIcon className={styles.memberIcon} />
              <div>
                <p className={styles.memberTitle}>
                  현재 인원 {appointment.memberCount}명
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/appointments/${appointment.appointmentId}/members`}
              className={styles.memberButton}>
              멤버보기
            </Link>
          </div>
        </div>

        <AppointmentDetailActions
          appointmentId={appointment.appointmentId}
          appointmentTitle={appointment.title}
          initialStatus={appointment.status}
          isOwner={appointment.isOwner}
          initialIsMember={appointment.isMember}
        />

        <AppointmentCommentsSection
          appointmentId={appointment.appointmentId}
        />
      </div>
    </div>
  );
}
