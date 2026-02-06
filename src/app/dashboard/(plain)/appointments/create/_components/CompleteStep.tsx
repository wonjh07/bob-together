import Link from 'next/link';
import { useFormContext } from 'react-hook-form';

import CheckIcon from '@/components/icons/CheckIcon';

import * as styles from './CompleteStep.css';

import type { CreateAppointmentForm } from '../types';

interface CompleteStepProps {
  appointmentId: string | null;
}

export function CompleteStep({ appointmentId }: CompleteStepProps) {
  const { watch } = useFormContext<CreateAppointmentForm>();
  const { title, date, startTime, endTime } = watch();
  const invitationHref = appointmentId
    ? `/dashboard/appointments/invitation?appointmentId=${appointmentId}&title=${encodeURIComponent(
        title,
      )}`
    : '/dashboard/appointments/invitation';

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.stepTitle}>약속 생성 완료</div>
      </div>
      <div className={styles.summaryCard}>
        <CheckIcon />
        <div className={styles.summaryRow}>
          <span className={styles.summaryValue}>{title}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>
            {date} {startTime} ~ {endTime}
          </span>
        </div>
      </div>
      <Link href={invitationHref} className={styles.primaryButton}>
        멤버 초대하기
      </Link>
      <Link href="/dashboard" className={styles.secondaryButton}>
        나중에 초대하기
      </Link>
    </div>
  );
}
