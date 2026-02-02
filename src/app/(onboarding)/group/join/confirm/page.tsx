'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getGroupByIdAction, joinGroupAction } from '@/actions/group';
import GroupIcon from '@/components/icons/GroupIcon';

import { groupName, message } from './page.css';
import { useOnboardingLayout } from '@/provider/moveback-provider';
import {
  page,
  panel,
  iconWrap,
  buttonStack,
  buttonBase,
  primaryButton,
  helperText,
} from '../../shared.css';

export default function GroupJoinConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setShowMoveback } = useOnboardingLayout();

  const groupId = searchParams.get('groupId') || '';
  const initialName = searchParams.get('groupName') || '';

  const [currentName, setCurrentName] = useState(initialName);
  const [errorMessage, setErrorMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    setShowMoveback(true);
    return () => setShowMoveback(false);
  }, [setShowMoveback]);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) {
        setErrorMessage('그룹 정보가 필요합니다.');
        return;
      }

      if (currentName) return;

      const result = await getGroupByIdAction(groupId);
      if (!result.ok) {
        setErrorMessage(result.message || '그룹 정보를 불러올 수 없습니다.');
        return;
      }
      if (!result.data) {
        setErrorMessage('그룹 정보를 확인할 수 없습니다.');
        return;
      }
      setCurrentName(result.data.name);
    };

    fetchGroup();
  }, [groupId, currentName]);

  const handleJoin = async () => {
    if (!groupId) {
      setErrorMessage('그룹 정보가 필요합니다.');
      return;
    }

    setIsJoining(true);
    setErrorMessage('');
    const result = await joinGroupAction(groupId);
    setIsJoining(false);

    if (!result.ok) {
      setErrorMessage(result.message || '그룹 가입에 실패했습니다.');
      return;
    }

    router.push(
      `/group/join/complete?groupName=${encodeURIComponent(currentName)}`,
    );
  };

  return (
    <div className={page}>
      <div className={panel}>
        <div className={iconWrap}>
          <GroupIcon />
        </div>
        <div className={groupName}>{currentName || '그룹'}</div>
        <div className={message}>그룹에 가입하시겠습니까?</div>
        <div className={buttonStack}>
          <button
            type="button"
            className={`${buttonBase} ${primaryButton}`}
            onClick={handleJoin}
            disabled={isJoining}>
            {isJoining ? '가입 중...' : '가입하기'}
          </button>
        </div>
        <div className={helperText}>{errorMessage}</div>
      </div>
    </div>
  );
}
