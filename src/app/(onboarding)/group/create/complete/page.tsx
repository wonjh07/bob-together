'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import GroupIcon from '@/components/icons/GroupIcon';

import { caption, completeTitle, groupName } from './page.css';
import {
  page,
  panel,
  iconWrap,
  buttonStack,
  buttonBase,
  primaryButton,
  secondaryButton,
  linkButton,
} from '../../shared.css';

export default function GroupCreateCompletePage() {
  const searchParams = useSearchParams();
  const currentGroupName = searchParams.get('groupName');
  const groupId = searchParams.get('groupId');

  return (
    <div className={page}>
      <div className={panel}>
        <div className={iconWrap}>
          <GroupIcon />
        </div>
        {currentGroupName && (
          <div className={groupName}>{currentGroupName}</div>
        )}
        <div className={completeTitle}>그룹 생성 완료</div>
        <div className={caption}>지금 바로 멤버를 초대해볼까요?</div>
        <div className={buttonStack}>
          <Link
            href={
              groupId
                ? `/group/invitation?groupId=${groupId}&groupName=${encodeURIComponent(
                    currentGroupName || '',
                  )}`
                : '/group/invitation'
            }
            className={`${buttonBase} ${primaryButton} ${linkButton}`}>
            멤버 초대하기
          </Link>
          <Link
            href="/dashboard"
            className={`${buttonBase} ${secondaryButton} ${linkButton}`}>
            나중에 초대하기
          </Link>
        </div>
      </div>
    </div>
  );
}
