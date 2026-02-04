import Link from 'next/link';

import PaperPlaneIcon from '@/components/icons/PaperPlaneIcon';

import { title, panel, completePage } from './page.css';

import {
  buttonBase,
  primaryButton,
  linkButton,
} from '@/app/(onboarding)/group/shared.css';

export default function AppointmentInvitationCompletePage() {
  return (
    <div className={completePage}>
      <div className={panel}>
        <PaperPlaneIcon />
        <div className={title}>약속 초대 완료</div>
        <Link
          href="/dashboard"
          className={`${buttonBase} ${primaryButton} ${linkButton}`}>
          확인
        </Link>
      </div>
    </div>
  );
}
