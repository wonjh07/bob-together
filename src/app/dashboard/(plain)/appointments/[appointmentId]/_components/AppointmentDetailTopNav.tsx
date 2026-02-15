'use client';

import { useRouter } from 'next/navigation';

import PlainTopNav from '@/components/ui/PlainTopNav';

interface AppointmentDetailTopNavProps {
  appointmentId: string;
  canEdit: boolean;
}

export default function AppointmentDetailTopNav({
  appointmentId,
  canEdit,
}: AppointmentDetailTopNavProps) {
  const router = useRouter();

  return (
    <PlainTopNav
      title="약속 상세"
      rightLabel="수정"
      rightAriaLabel="약속 수정"
      rightHidden={!canEdit}
      onRightAction={() => router.push(`/dashboard/appointments/${appointmentId}/edit`)}
    />
  );
}
