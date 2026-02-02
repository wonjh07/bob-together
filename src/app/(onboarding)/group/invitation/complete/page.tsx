'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import PaperPlaneIcon from '@/components/icons/PaperPlaneIcon';

import { completeTitle } from './page.css';
import {
  page,
  panel,
  iconWrap,
  buttonStack,
  buttonBase,
  primaryButton,
  linkButton,
} from '../../shared.css';

export default function GroupInvitationCompletePage() {
  const searchParams = useSearchParams();
  const groupName = searchParams.get('groupName');

  return (
    <div className={page}>
      <div className={panel}>
        <div className={iconWrap}>
          <PaperPlaneIcon />
        </div>
        <div className={completeTitle}>
          {groupName ? `${groupName} 초대 완료` : '그룹 초대 완료'}
        </div>
        <div className={buttonStack}>
          <Link
            href="/dashboard"
            className={`${buttonBase} ${primaryButton} ${linkButton}`}>
            확인
          </Link>
        </div>
      </div>
    </div>
  );
}
