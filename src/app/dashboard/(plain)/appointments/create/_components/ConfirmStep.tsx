import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { createAppointmentAction } from '@/actions/appointment';
import { useCreateAppointmentContext } from '@/app/dashboard/(plain)/appointments/create/providers';
import { KakaoMapPreview } from '@/components/kakao/KakaoMapPreview';
import AppointmentPlaceMeta from '@/components/ui/AppointmentPlaceMeta';
import DateTimeMetaRow from '@/components/ui/DateTimeMetaRow';
import IconLabel from '@/components/ui/IconLabel';
import { useRequestError } from '@/hooks/useRequestError';
import {
  invalidateAppointmentCollectionQueries,
} from '@/libs/query/invalidateAppointmentQueries';

import * as styles from './ConfirmStep.css';

import type { CreateAppointmentForm } from '../types';

interface ConfirmStepProps {
  onCreated: (appointmentId: string) => void;
  onBindSubmit?: (submit: (() => void) | null) => void;
}

export function ConfirmStep({ onCreated, onBindSubmit }: ConfirmStepProps) {
  const queryClient = useQueryClient();
  const { groups } = useCreateAppointmentContext();
  const { showRequestError } = useRequestError();
  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateAppointmentForm>();
  const [groupId, title, date, startTime, endTime, place] = useWatch({
    name: ['groupId', 'title', 'date', 'startTime', 'endTime', 'place'],
  });

  const currentGroupName = useMemo(() => {
    if (!groupId) return '그룹 선택';
    return (
      groups.find((group) => group.groupId === groupId)?.name ?? '그룹 선택'
    );
  }, [groupId, groups]);
  const startAt = `${date}T${startTime}:00`;
  const endsAt = `${date}T${endTime}:00`;

  const handleCreate = handleSubmit(async (values) => {
    if (!values.groupId) {
      setError('root', { message: '그룹을 선택해주세요.' });
      return;
    }
    if (!values.place) {
      setError('root', { message: '장소를 선택해주세요.' });
      return;
    }
    if (!values.title || !values.date || !values.startTime || !values.endTime) {
      setError('root', { message: '약속 정보를 확인해주세요.' });
      return;
    }

    clearErrors('root');

    const result = await createAppointmentAction({
      title: values.title.trim(),
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      place: values.place!,
      groupId: values.groupId!,
    });

    if (!result.ok) {
      showRequestError(result, {
        fallbackMessage: '약속 생성 중 오류가 발생했습니다.',
      });
      return;
    }

    if (!result.data) {
      showRequestError('약속 정보를 확인할 수 없습니다.');
      return;
    }

    await invalidateAppointmentCollectionQueries(queryClient);
    onCreated(result.data.appointmentId);
  });

  useEffect(() => {
    if (!onBindSubmit) {
      return;
    }

    onBindSubmit(() => {
      void handleCreate();
    });

    return () => {
      onBindSubmit(null);
    };
  }, [handleCreate, onBindSubmit]);

  return (
    <div className={styles.container}>
      <div className={styles.stepTitle}>약속 정보를 확인해주세요</div>
      <div>
        <h1 className={styles.appointmentTitle}>{title}</h1>
        <DateTimeMetaRow startAt={startAt} endsAt={endsAt} />
        <div className={styles.placeSection}>
          <AppointmentPlaceMeta
            placeName={place?.name ?? '장소 선택'}
            rating={null}
            reviewCount={0}
            category={place?.category ?? null}
            showReviewCountWhenZero={false}
          />
        </div>
      </div>
      <div className={styles.mapWrapper}>
        {place && (
          <KakaoMapPreview
            latitude={place.latitude}
            longitude={place.longitude}
            title={place.name}
            address={place.roadAddress || place.address}
            isInteractive={false}
          />
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.memberRow}>
          <IconLabel
            icon="group"
            count={<span className={styles.memberTitle}>{currentGroupName}</span>}
          />
        </div>
      </div>

      <div className={styles.helperText}>
        {errors.root?.message?.toString() ?? ''}
      </div>
    </div>
  );
}
