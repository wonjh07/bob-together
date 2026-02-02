'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import CheckIcon from '@/components/icons/CheckIcon';

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

export default function GroupJoinCompletePage() {
  const searchParams = useSearchParams();
  const groupName = searchParams.get('groupName');

  return (
    <div className={page}>
      <div className={panel}>
        <div className={iconWrap}>
          <CheckIcon />
        </div>
        <div className={completeTitle}>
          {groupName ? `${groupName} 가입 완료` : '가입 완료'}
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
