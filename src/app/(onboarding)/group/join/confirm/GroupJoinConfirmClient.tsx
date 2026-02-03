'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { joinGroupAction } from '@/actions/group';
import { getActionErrorMessage } from '@/utils/actionResult';

import { buttonBase, primaryButton, helperText } from '../../shared.css';

type GroupJoinConfirmClientProps = {
  groupId: string;
  groupName: string;
};

export default function GroupJoinConfirmClient({
  groupId,
  groupName,
}: GroupJoinConfirmClientProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!groupId) {
      setErrorMessage('그룹 정보가 필요합니다.');
      return;
    }

    setIsJoining(true);
    setErrorMessage('');
    const result = await joinGroupAction(groupId);
    setIsJoining(false);

    const error = getActionErrorMessage(result, '그룹 가입에 실패했습니다.');
    if (error) {
      setErrorMessage(error);
      return;
    }

    router.push(
      `/group/join/complete?groupName=${encodeURIComponent(groupName)}`,
    );
  };

  return (
    <>
      <button
        type="button"
        className={`${buttonBase} ${primaryButton}`}
        onClick={handleJoin}
        disabled={isJoining}>
        {isJoining ? '가입 중...' : '가입하기'}
      </button>
      {errorMessage && <div className={helperText}>{errorMessage}</div>}
    </>
  );
}
