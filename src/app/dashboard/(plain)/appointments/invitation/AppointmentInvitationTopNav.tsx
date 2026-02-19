'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import PlainTopNav from '@/components/ui/PlainTopNav';

interface AppointmentInvitationTopNavProps {
  completeHref: string;
}

export default function AppointmentInvitationTopNav({
  completeHref,
}: AppointmentInvitationTopNavProps) {
  const router = useRouter();

  const handleComplete = () => {
    toast.success('약속 초대를 완료했습니다.');
    router.push(completeHref);
  };

  return (
    <PlainTopNav
      title="그룹원 초대"
      rightLabel="완료"
      rightAriaLabel="초대 완료"
      onRightAction={handleComplete}
    />
  );
}
