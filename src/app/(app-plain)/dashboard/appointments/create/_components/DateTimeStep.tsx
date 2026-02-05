import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { getDefaultDateTimeValues } from '@/utils/dateTime';

import * as styles from './DateTimeStep.css';

import type { CreateAppointmentForm } from '../types';
import NextButton from './ui/NextButton';

interface DateTimeStepProps {
  onNext: () => void;
}

export function DateTimeStep({ onNext }: DateTimeStepProps) {
  const {
    register,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<CreateAppointmentForm>();

  useEffect(() => {
    const defaults = getDefaultDateTimeValues();
    const currentDate = getValues('date');
    const currentStartTime = getValues('startTime');
    const currentEndTime = getValues('endTime');

    if (!currentDate) {
      setValue('date', defaults.date, { shouldDirty: false });
    }
    if (!currentStartTime) {
      setValue('startTime', defaults.startTime, { shouldDirty: false });
    }
    if (!currentEndTime) {
      setValue('endTime', defaults.endTime, { shouldDirty: false });
    }
  }, [getValues, setValue]);

  const handleNext = async () => {
    const isValid = await trigger(['date', 'startTime', 'endTime']);
    if (!isValid) return;
    onNext();
  };

  return (
    <div className={styles.container}>
      <NextButton handleNext={handleNext} />
      <div className={styles.stepTitle}>약속 일자를 입력해주세요</div>
      <div className={styles.section}>
        <label className={styles.inputLabel} htmlFor="appointment-date">
          약속 날짜
        </label>
        <input
          id="appointment-date"
          type="date"
          className={styles.underlineInput}
          {...register('date', { required: '약속 날짜를 입력해주세요.' })}
        />
      </div>
      <div className={styles.section}>
        <div className={styles.inputLabel}>약속 시간</div>
        <div className={styles.timeRow}>
          <input
            type="time"
            className={`${styles.underlineInput} ${styles.timeInput}`}
            {...register('startTime', {
              required: '약속 시간을 입력해주세요.',
            })}
          />
          <input
            type="time"
            className={`${styles.underlineInput} ${styles.timeInput}`}
            {...register('endTime', {
              required: '약속 시간을 입력해주세요.',
              validate: (value) => {
                const startTime = getValues('startTime');
                if (!startTime || !value) return true;
                return (
                  value > startTime ||
                  '종료 시간이 시작 시간보다 늦어야 합니다.'
                );
              },
            })}
          />
        </div>
      </div>
      <div className={styles.helperText}>
        {errors.date?.message?.toString() ??
          errors.startTime?.message?.toString() ??
          errors.endTime?.message?.toString() ??
          ''}
      </div>
    </div>
  );
}
