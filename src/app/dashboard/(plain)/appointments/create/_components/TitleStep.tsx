import { useFormContext } from 'react-hook-form';

import * as styles from './TitleStep.css';

import type { CreateAppointmentForm } from '../types';
import NextButton from './ui/NextButton';

interface TitleStepProps {
  onNext: () => void;
}

export function TitleStep({ onNext }: TitleStepProps) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<CreateAppointmentForm>();

  const handleNext = async () => {
    const isValid = await trigger('title');
    if (!isValid) return;
    onNext();
  };

  return (
    <div className={styles.container}>
      <NextButton handleNext={handleNext} />
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
