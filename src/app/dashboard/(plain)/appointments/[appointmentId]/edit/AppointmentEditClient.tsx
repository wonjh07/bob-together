'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { updateAppointmentAction } from '@/actions/appointment';
import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import { KakaoMapPreview } from '@/components/kakao/KakaoMapPreview';
import {
  invalidateAppointmentDetailQuery,
  invalidateAppointmentListQueries,
  invalidateAppointmentSearchQueries,
} from '@/libs/query/invalidateAppointmentQueries';

import AppointmentEditTopNav from './_components/AppointmentEditTopNav';
import * as styles from './page.css';

interface AppointmentEditPlace {
  placeId: string | null;
  kakaoId: string | null;
  name: string;
  address: string;
  category: string | null;
  latitude: number;
  longitude: number;
  reviewAverage: number | null;
  reviewCount: number;
}

interface AppointmentEditClientProps {
  appointmentId: string;
  initialTitle: string;
  initialDate: string;
  initialStartTime: string;
  initialEndTime: string;
  initialPlace: AppointmentEditPlace;
}

function parseDistrict(address: string): string {
  const parts = address.split(' ');
  return parts.find((part) => part.endsWith('동') || part.endsWith('구')) || '';
}

export default function AppointmentEditClient({
  appointmentId,
  initialTitle,
  initialDate,
  initialStartTime,
  initialEndTime,
  initialPlace,
}: AppointmentEditClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const placeMetaDistrict = useMemo(
    () => parseDistrict(initialPlace.address),
    [initialPlace.address],
  );
  const reviewAverageText =
    initialPlace.reviewAverage !== null ? initialPlace.reviewAverage.toFixed(1) : '-';

  const placeSearchLink = useMemo(() => {
    const params = new URLSearchParams({
      q: initialPlace.name,
      title,
      date,
      startTime,
      endTime,
    });
    return `/dashboard/appointments/${appointmentId}/edit/place?${params.toString()}`;
  }, [appointmentId, date, endTime, initialPlace.name, startTime, title]);

  const handleComplete = async () => {
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('약속 제목을 입력해주세요.');
      return;
    }

    if (!date || !startTime || !endTime) {
      setErrorMessage('약속 날짜와 시간을 입력해주세요.');
      return;
    }

    if (endTime <= startTime) {
      setErrorMessage('종료 시간이 시작 시간보다 늦어야 합니다.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const result = await updateAppointmentAction({
      appointmentId,
      title: trimmedTitle,
      date,
      startTime,
      endTime,
      place: {
        placeId: initialPlace.placeId,
        kakaoId: initialPlace.kakaoId,
        name: initialPlace.name,
        address: initialPlace.address,
        category: initialPlace.category,
        latitude: initialPlace.latitude,
        longitude: initialPlace.longitude,
      },
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message || '약속 수정에 실패했습니다.');
      return;
    }

    toast.success('약속이 수정되었습니다.');
    await Promise.all([
      invalidateAppointmentDetailQuery(queryClient, appointmentId),
      invalidateAppointmentListQueries(queryClient),
      invalidateAppointmentSearchQueries(queryClient),
    ]);
    router.replace(`/dashboard/appointments/${appointmentId}`);
  };

  return (
    <div className={styles.page}>
      <AppointmentEditTopNav onComplete={handleComplete} isSubmitting={isSubmitting} />
      <div className={styles.content}>
        <div className={styles.block}>
          <p className={styles.label}>약속 제목</p>
          <input
            type="text"
            className={styles.underlineInput}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="약속 제목을 입력하세요"
          />
        </div>

        <div className={styles.block}>
          <p className={styles.label}>약속 날짜</p>
          <div className={styles.timeRow}>
            <div className={styles.dateTimeItem}>
              <CalendarIcon className={styles.dateTimeIcon} />
              <input
                type="date"
                className={`${styles.underlineInput} ${styles.timeInput}`}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className={styles.dateTimeItem}>
              <ClockIcon className={styles.dateTimeIcon} />
              <input
                type="time"
                className={`${styles.underlineInput} ${styles.timeInput}`}
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
              <span>-</span>
              <input
                type="time"
                className={`${styles.underlineInput} ${styles.timeInput}`}
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.block}>
          <p className={styles.label}>약속 장소</p>
          <h2 className={styles.placeName}>{initialPlace.name}</h2>
          <div className={styles.placeMetaRow}>
            <span className={styles.star}>★</span>
            <span>
              {reviewAverageText}
              {initialPlace.reviewCount ? ` (${initialPlace.reviewCount})` : ''}
            </span>
            {placeMetaDistrict ? <span>· {placeMetaDistrict}</span> : null}
            {initialPlace.category ? <span>· {initialPlace.category}</span> : null}
          </div>
        </div>

        <div className={styles.mapWrapper}>
          <KakaoMapPreview
            latitude={initialPlace.latitude}
            longitude={initialPlace.longitude}
            title={initialPlace.name}
            address={initialPlace.address}
            isInteractive={false}
          />
        </div>

        <Link href={placeSearchLink} className={styles.placeChangeButton}>
          장소변경
        </Link>

        <p className={styles.helperText}>{errorMessage}</p>
      </div>
    </div>
  );
}
