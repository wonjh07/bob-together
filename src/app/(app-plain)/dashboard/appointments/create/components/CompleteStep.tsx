import Link from 'next/link';

import CheckIcon from '@/components/icons/CheckIcon';

import {
  headerRow,
  primaryButton,
  secondaryButton,
  stepTitle,
  summaryCard,
  summaryRow,
  summaryValue,
} from './CompleteStep.css';

interface CompleteStepProps {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentId: string | null;
}

export function CompleteStep({
  title,
  date,
  startTime,
  endTime,
  appointmentId,
}: CompleteStepProps) {
  const invitationHref = appointmentId
    ? `/dashboard/appointments/invitation?appointmentId=${appointmentId}&title=${encodeURIComponent(
        title,
      )}`
    : '/dashboard/appointments/invitation';

  return (
    <>
      <div className={headerRow}>
        <div className={stepTitle}>약속 생성 완료</div>
      </div>
      <div className={summaryCard}>
        <CheckIcon />
        <div className={summaryRow}>
          <span className={summaryValue}>{title}</span>
        </div>
        <div className={summaryRow}>
          <span>
            {date} {startTime} ~ {endTime}
          </span>
        </div>
      </div>
      <Link href={invitationHref} className={primaryButton}>
        멤버 초대하기
      </Link>
      <Link href="/dashboard" className={secondaryButton}>
        나중에 초대하기
      </Link>
    </>
  );
}
