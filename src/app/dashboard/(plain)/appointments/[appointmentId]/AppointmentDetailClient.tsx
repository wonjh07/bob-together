'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import GroupIcon from '@/components/icons/GroupIcon';
import { KakaoMapPreview } from '@/components/kakao/KakaoMapPreview';
import AppointmentPlaceMeta from '@/components/ui/AppointmentPlaceMeta';
import DateTimeMetaRow from '@/components/ui/DateTimeMetaRow';
import IconLabel from '@/components/ui/IconLabel';
import PlainTopNav from '@/components/ui/PlainTopNav';
import UserIdentityInline from '@/components/ui/UserIdentityInline';
import {
  createAppointmentDetailQueryOptions,
} from '@/libs/query/appointmentQueries';
import { extractDistrict } from '@/utils/address';
import {
  formatDateDot,
  formatRelativeKorean,
  formatTimeRange24,
} from '@/utils/dateFormat';

import AppointmentCommentsSection from './_components/AppointmentCommentsSection';
import AppointmentDetailActions from './_components/AppointmentDetailActions';
import * as styles from './page.css';

interface AppointmentDetailClientProps {
  appointmentId: string;
}

export default function AppointmentDetailClient({
  appointmentId,
}: AppointmentDetailClientProps) {
  const router = useRouter();
  const detailQuery = useQuery(createAppointmentDetailQueryOptions(appointmentId));

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
        <PlainTopNav title="약속 상세" rightHidden />
        <div className={styles.errorBox}>
          {detailQuery.error instanceof Error
            ? detailQuery.error.message
            : '약속 정보를 불러올 수 없습니다.'}
        </div>
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
  const district = extractDistrict(appointment.place.address);

  return (
    <div className={styles.page}>
      <PlainTopNav
        title="약속 상세"
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
            avatarSize="xl"
            me={appointment.isOwner}
            rowClassName={styles.authorRow}
            avatarClassName={styles.authorAvatar}
            nameRowClassName={styles.authorNameLine}
            meClassName={styles.meText}
            subtitleClassName={styles.authorMeta}
          />

          <h1 className={styles.appointmentTitle}>{appointment.title}</h1>

          <DateTimeMetaRow
            date={formatDateDot(appointment.startAt)}
            timeRange={formatTimeRange24(appointment.startAt, appointment.endsAt)}
            rowClassName={styles.dateTimeRow}
            itemClassName={styles.dateTimeItem}
            iconClassName={styles.dateTimeIcon}
            dateIconSize={22}
            timeIconSize={22}
          />

          <AppointmentPlaceMeta
            placeName={appointment.place.name}
            placeNameAs="h2"
            placeNameClassName={styles.placeName}
            placeHref={`/dashboard/places/${appointment.place.placeId}`}
            rating={appointment.place.reviewAverage}
            reviewCount={appointment.place.reviewCount}
            district={district}
            category={appointment.place.category}
            wrapperClassName={styles.placeSection}
            metaClassName={styles.placeMetaRow}
            starClassName={styles.star}
          />

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
            <IconLabel
              className={styles.memberInfo}
              icon={<GroupIcon className={styles.memberIcon} />}>
              <p className={styles.memberTitle}>
                현재 인원 {appointment.memberCount}명
              </p>
            </IconLabel>
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
          endsAt={appointment.endsAt}
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
