import { useFormContext } from 'react-hook-form';

import * as styles from './TitleStep.css';

import type { CreateAppointmentForm } from '../types';

export function TitleStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateAppointmentForm>();

  return (
    <div className={styles.container}>
      <div className={styles.stepTitle}>약속 제목을 입력해주세요</div>
      <div className={styles.section}>
        <label className={styles.inputLabel} htmlFor="appointment-title">
          약속 제목
        </label>
        <input
          id="appointment-title"
          className={styles.underlineInput}
          placeholder="약속 제목을 입력하세요"
          {...register('title', {
            validate: (value) =>
              value.trim().length > 0 || '약속 제목을 입력해주세요.',
          })}
        />
      </div>
      <div className={styles.helperText}>
        {errors.title?.message?.toString() ?? ''}
      </div>
    </div>
  );
}
