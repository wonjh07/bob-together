import Link from 'next/link';

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

type GroupJoinCompletePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function GroupJoinCompletePage({
  searchParams,
}: GroupJoinCompletePageProps) {
  const groupName =
    typeof searchParams?.groupName === 'string'
      ? searchParams.groupName
      : undefined;

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
