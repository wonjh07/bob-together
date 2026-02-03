'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { searchUsersAction, sendGroupInvitationAction } from '@/actions/group';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOnboardingLayout } from '@/provider/layout-context';
import { groupSearchFormSchema } from '@/schemas/group';

import {
  invitationPage,
  invitationPanel,
  headerRow,
  headerTitle,
  headerMeta,
  actionLink,
  searchBlock,
  searchLabel,
  searchRow,
  searchInput,
  searchButton,
  results,
  resultItem,
  resultInfo,
  resultName,
  resultSub,
  inviteButton,
  invitedButton,
  helperText,
} from './page.css';
import { buttonBase, primaryButton } from '../shared.css';

import type { UserSummary } from '@/actions/group';
import type { GroupSearchFormInput } from '@/schemas/group';

export default function GroupInvitationPage() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId') || '';
  const groupName = searchParams.get('groupName') || '';
  const { setShowMoveback } = useOnboardingLayout();

  const [resultUsers, setResultUsers] = useState<UserSummary[]>([]);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GroupSearchFormInput>({
    resolver: zodResolver(groupSearchFormSchema),
    mode: 'onChange',
  });

  const queryValue = watch('query');
  const debouncedQuery = useDebouncedValue(queryValue, 500);

  const completeHref = useMemo(() => {
    if (!groupId) return '/group/invitation/complete';
    return `/group/invitation/complete?groupId=${groupId}&groupName=${encodeURIComponent(
      groupName,
    )}`;
  }, [groupId, groupName]);

  useEffect(() => {
    setShowMoveback(true);
    return () => setShowMoveback(false);
  }, [setShowMoveback]);

  const performSearch = useCallback(
    async (query: string) => {
      if (!groupId) {
        setErrorMessage('그룹 정보가 필요합니다.');
        return;
      }

      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
        setResultUsers([]);
        return;
      }

      setIsSearching(true);
      setErrorMessage('');
      const result = await searchUsersAction(trimmedQuery);
      setIsSearching(false);

      if (!result.ok) {
        setErrorMessage(result.message || '사용자 검색에 실패했습니다.');
        return;
      }

      if (!result.data) {
        setErrorMessage('검색 결과를 불러올 수 없습니다.');
        return;
      }

      setResultUsers(result.data.users);
    },
    [groupId],
  );

  useEffect(() => {
    if (!debouncedQuery) {
      setResultUsers([]);
      return;
    }

    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const onSubmit = async (data: GroupSearchFormInput) => {
    await performSearch(data.query);
  };

  const handleInvite = async (userId: string) => {
    if (!groupId) {
      setErrorMessage('그룹 정보가 필요합니다.');
      return;
    }

    setIsInviting((prev) => ({ ...prev, [userId]: true }));
    setErrorMessage('');

    const result = await sendGroupInvitationAction(groupId, userId);

    setIsInviting((prev) => ({ ...prev, [userId]: false }));

    if (!result.ok) {
      setErrorMessage(result.message || '초대에 실패했습니다.');
      return;
    }

    setInvitedIds((prev) => [...prev, userId]);
  };

  return (
    <div className={invitationPage}>
      <div className={invitationPanel}>
        <div className={headerRow}>
          <div>
            <div className={headerTitle}>새 멤버를 초대해주세요</div>
            {groupName && <div className={headerMeta}>{groupName}</div>}
          </div>
          <Link href={completeHref} className={actionLink}>
            완료
          </Link>
        </div>

        <form className={searchBlock} onSubmit={handleSubmit(onSubmit)}>
          <label className={searchLabel} htmlFor="query">
            새멤버 검색
          </label>
          <div className={searchRow}>
            <input
              id="query"
              className={searchInput}
              placeholder="닉네임 또는 이름으로 검색"
              {...register('query')}
            />
            <button
              type="submit"
              className={`${buttonBase} ${primaryButton} ${searchButton}`}
              disabled={isSearching}>
              {isSearching ? '검색 중' : '검색'}
            </button>
          </div>
          <div className={helperText}>
            {errors.query?.message || errorMessage}
          </div>
        </form>

        <div className={results}>
          {resultUsers.map((user) => {
            const isInvited = invitedIds.includes(user.userId);
            const isLoading = !!isInviting[user.userId];
            const secondaryText =
              user.nickname && user.name
                ? user.name
                : user.name || user.nickname || '정보 없음';
            return (
              <div className={resultItem} key={user.userId}>
                <div className={resultInfo}>
                  <div className={resultName}>
                    {user.nickname || user.name || '알 수 없음'}
                  </div>
                  <div className={resultSub}>{secondaryText}</div>
                </div>
                <button
                  type="button"
                  className={`${inviteButton} ${isInvited ? invitedButton : ''}`}
                  onClick={() => handleInvite(user.userId)}
                  disabled={isInvited || isLoading}>
                  {isInvited ? '초대됨' : isLoading ? '전송 중' : '초대하기'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
