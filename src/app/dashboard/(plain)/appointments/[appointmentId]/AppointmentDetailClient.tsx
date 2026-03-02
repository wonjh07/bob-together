'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { KakaoMapPreview } from '@/components/kakao/KakaoMapPreview';
import AppointmentPlaceMeta from '@/components/ui/AppointmentPlaceMeta';
import DateTimeMetaRow from '@/components/ui/DateTimeMetaRow';
import IconLabel from '@/components/ui/IconLabel';
import PlainTopNav from '@/components/ui/PlainTopNav';
import UserIdentityInline from '@/components/ui/UserIdentityInline';
import { useRequestErrorPresenter } from '@/hooks/useRequestErrorPresenter';
import { createAppointmentDetailQueryOptions } from '@/libs/query/appointmentQueries';
import { useQueryScope } from '@/provider/query-scope-provider';
import { formatRelativeKorean } from '@/utils/dateFormat';

import AppointmentCommentsSection from './_components/AppointmentCommentsSection';
import * as styles from './page.css';

interface AppointmentDetailClientProps {
  appointmentId: string;
}

export default function AppointmentDetailClient({
  appointmentId,
}: AppointmentDetailClientProps) {
  const router = useRouter();
  const queryScope = useQueryScope();
  const { syncRequestError } = useRequestErrorPresenter({
    source: 'AppointmentDetailClient.detailQuery.error',
    fallbackMessage: '약속 정보를 불러올 수 없습니다.',
  });
  const detailQuery = useQuery(
    createAppointmentDetailQueryOptions(appointmentId, queryScope),
  );
  const detailErrorMessage = useMemo(() => {
    if (!detailQuery.isError) return '';
    return detailQuery.error instanceof Error
      ? detailQuery.error.message
      : '약속 정보를 불러올 수 없습니다.';
  }, [detailQuery.error, detailQuery.isError]);

  useEffect(() => {
    syncRequestError({
      isError: Boolean(detailErrorMessage),
      err: detailQuery.error,
      message: detailErrorMessage,
    });
  }, [detailErrorMessage, detailQuery.error, syncRequestError]);

  if (detailQuery.isLoading) {
    return (
      <div className={styles.page}>
        <PlainTopNav title="약속 상세" rightHidden />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className={styles.page}>
        <PlainTopNav title="약속 상세" rightHidden />{' '}
      </div>
    );
  }

  const appointment = detailQuery.data.appointment;
  const createdLabel = formatRelativeKorean(appointment.createdAt);
  const displayName =
    appointment.creatorNickname || appointment.creatorName || '알 수 없음';
  const authorSubText = [appointment.creatorName, createdLabel]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={styles.page}>
      <PlainTopNav
        title="약속 상세"
        onBack={() => router.back()}
        rightLabel="수정"
        rightAriaLabel="약속 수정"
        rightHidden={!appointment.isOwner}
        onRightAction={() =>
          router.push(`/dashboard/appointments/${appointmentId}/edit`)
        }
      />
      <div className={styles.content}>
        <div>
          <UserIdentityInline
            name={displayName}
            subtitle={authorSubText}
            avatarSrc={appointment.creatorProfileImage}
            avatarAlt="작성자 프로필 이미지"
            size="lg"
            me={appointment.isOwner}
          />
          <h1 className={styles.appointmentTitle}>{appointment.title}</h1>

          <DateTimeMetaRow
            startAt={appointment.startAt}
            endsAt={appointment.endsAt}
          />

          <div className={styles.placeSection}>
            <AppointmentPlaceMeta
              placeName={appointment.place.name}
              placeHref={`/dashboard/places/${appointment.place.placeId}`}
              rating={appointment.place.reviewAverage}
              reviewCount={appointment.place.reviewCount}
              category={appointment.place.category}
            />
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

        <Link
          href={`/dashboard/appointments/${appointment.appointmentId}/members`}
          className={styles.memberCardLink}>
          <IconLabel
            icon="group"
            count={
              <span className={styles.memberTitle}>
                {appointment.groupName ?? '그룹'}
              </span>
            }
          />
          <span className={styles.memberCardLinkText}>
            현재 인원 {appointment.memberCount}명
          </span>
        </Link>

        <AppointmentCommentsSection appointmentId={appointment.appointmentId} />
      </div>
    </div>
  );
}
