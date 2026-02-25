'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import {
  searchGroupInvitableUsersAction,
  sendGroupInvitationAction,
} from '@/actions/group';
import PlainTopNav from '@/components/ui/PlainTopNav';
import SearchInput from '@/components/ui/SearchInput';
import { groupSearchFormSchema } from '@/schemas/group';

import {
  invitationPage,
  invitationPanel,
  headerDescription,
  searchBlock,
  searchLabel,
  results,
  resultItem,
  resultInfo,
  resultName,
  resultSub,
  inviteButton,
  invitedButton,
  helperText,
  emptyResult,
} from './page.css';

import type { UserSummary } from '@/actions/group';
import type { GroupSearchFormInput } from '@/schemas/group';

type GroupMemberInvitationClientProps = {
  groupId: string;
};

export default function GroupMemberInvitationClient({
  groupId,
}: GroupMemberInvitationClientProps) {
  const [resultUsers, setResultUsers] = useState<UserSummary[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState<Record<string, boolean>>({});

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupSearchFormInput>({
    defaultValues: {
      query: '',
    },
    resolver: zodResolver(groupSearchFormSchema),
    mode: 'onChange',
  });

  const performSearch = useCallback(
    async (query: string) => {
      if (!groupId) {
        setErrorMessage('그룹 정보가 필요합니다.');
        return;
      }

      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
        setResultUsers([]);
        setIsSearched(false);
        return;
      }

      setIsSearching(true);
      setErrorMessage('');
      setIsSearched(false);
      const result = await searchGroupInvitableUsersAction(groupId, trimmedQuery);
      setIsSearching(false);

      if (!result.ok) {
        setErrorMessage(result.message || '사용자 검색에 실패했습니다.');
        return;
      }

      if (!result.data) {
        setErrorMessage('검색 결과를 불러올 수 없습니다.');
        return;
      }

      const { users, pendingInviteeIds } = result.data;
      setResultUsers(users);
      setIsSearched(true);
      setInvitedIds((prev) =>
        Array.from(new Set([...prev, ...pendingInviteeIds])),
      );
    },
    [groupId],
  );

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
      if (result.error === 'already-member') {
        setMemberIds((prev) =>
          prev.includes(userId) ? prev : [...prev, userId],
        );
        return;
      }

      if (result.error === 'invite-already-sent') {
        setInvitedIds((prev) =>
          prev.includes(userId) ? prev : [...prev, userId],
        );
        return;
      }

      setErrorMessage(result.message || '초대에 실패했습니다.');
      return;
    }

    setInvitedIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    toast.success('그룹 초대를 보냈습니다.');
  };

  return (
    <div className={invitationPage}>
      <PlainTopNav title="멤버 초대" rightHidden />
      <div className={invitationPanel}>
        <div className={headerDescription}>그룹 멤버를 검색하고 초대해주세요</div>

        <form className={searchBlock} onSubmit={handleSubmit(onSubmit)}>
          <label className={searchLabel} htmlFor="query">
            닉네임 검색
          </label>
          <Controller
            control={control}
            name="query"
            render={({ field }) => (
              <SearchInput
                value={field.value ?? ''}
                onValueChange={field.onChange}
                inputId="query"
                placeholder="닉네임 또는 이름으로 검색"
                submitDisabled={isSearching}
              />
            )}
          />
          <div className={helperText}>
            {errors.query?.message || errorMessage}
          </div>
        </form>

        <div className={results}>
          {resultUsers.map((user) => {
            const isMember = memberIds.includes(user.userId);
            const isInvited = invitedIds.includes(user.userId);
            const isLoading = !!isInviting[user.userId];
            const isDisabled = isMember || isInvited || isLoading;
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
                  className={`${inviteButton} ${
                    isMember || isInvited ? invitedButton : ''
                  }`}
                  onClick={() => handleInvite(user.userId)}
                  disabled={isDisabled}>
                  {isMember
                    ? '그룹 멤버'
                    : isInvited
                      ? '초대 완료'
                      : isLoading
                        ? '전송 중'
                        : '초대하기'}
                </button>
              </div>
            );
          })}
          {isSearched && !isSearching && resultUsers.length === 0 ? (
            <div className={emptyResult}>검색 결과가 없습니다.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
