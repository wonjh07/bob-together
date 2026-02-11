import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { createAppointmentAction } from '@/actions/appointment';
import { useCreateAppointmentContext } from '@/app/dashboard/(plain)/appointments/create/providers';
import { KakaoMapPreview } from '@/components/kakao/KakaoMapPreview';

import * as styles from './ConfirmStep.css';

import type { CreateAppointmentForm } from '../types';

interface ConfirmStepProps {
  onCreated: (appointmentId: string) => void;
}

export function ConfirmStep({ onCreated }: ConfirmStepProps) {
  const { groups } = useCreateAppointmentContext();
  const {
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
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
      setError('root', {
        message: result.message || '약속 생성 중 오류가 발생했습니다.',
      });
      return;
    }

    if (!result.data) {
      setError('root', { message: '약속 정보를 확인할 수 없습니다.' });
      return;
    }

    onCreated(result.data.appointmentId);
  });

  return (
    <div className={styles.container}>
      <div className={styles.stepTitle}>약속 정보를 확인해주세요</div>
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
      <div className={styles.summaryCard}>
        <div className={styles.summaryRow}>
          <span>약속 제목:</span>
          <span className={styles.summaryValue}>{title}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>약속 일자:</span>
          <span className={styles.summaryValue}>{date}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>약속 시간:</span>
          <span className={styles.summaryValue}>
            {startTime} ~ {endTime}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span>그룹:</span>
          <span className={styles.summaryValue}>{currentGroupName}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>장소:</span>
          <span className={styles.summaryValue}>{place?.name ?? ''}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>주소:</span>
          <span className={styles.summaryValue}>
            {place?.roadAddress || place?.address || ''}
          </span>
        </div>
      </div>

      <div className={styles.helperText}>
        {errors.root?.message?.toString() ?? ''}
      </div>
      <button
        className={styles.primaryButton}
        onClick={handleCreate}
        disabled={isSubmitting}>
        {isSubmitting ? '생성 중...' : '생성하기'}
      </button>
    </div>
  );
}
