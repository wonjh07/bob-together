import Link from 'next/link';

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

type GroupInvitationCompletePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function GroupInvitationCompletePage({
  searchParams,
}: GroupInvitationCompletePageProps) {
  const groupName =
    typeof searchParams?.groupName === 'string'
      ? searchParams.groupName
      : undefined;

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
