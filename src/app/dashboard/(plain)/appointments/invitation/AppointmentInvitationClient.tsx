'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { sendAppointmentInvitationAction } from '@/actions/appointment';
import { searchUsersAction } from '@/actions/group';
import { appointmentKeys } from '@/libs/query/appointmentKeys';
import {
  createAppointmentInvitationStateQueryOptions,
  type AppointmentInvitationStateData,
} from '@/libs/query/appointmentQueries';
import { groupSearchFormSchema } from '@/schemas/group';

import {
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

import type { UserSummary } from '@/actions/group';
import type { GroupSearchFormInput } from '@/schemas/group';

import { buttonBase, primaryButton } from '@/app/(onboarding)/group/shared.css';

type AppointmentInvitationClientProps = {
  appointmentId: string;
};

export default function AppointmentInvitationClient({
  appointmentId,
}: AppointmentInvitationClientProps) {
  const queryClient = useQueryClient();
  const [resultUsers, setResultUsers] = useState<UserSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState<Record<string, boolean>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupSearchFormInput>({
    resolver: zodResolver(groupSearchFormSchema),
    mode: 'onChange',
  });

  const invitationStateQuery = useQuery({
    ...createAppointmentInvitationStateQueryOptions(appointmentId),
    enabled: !!appointmentId,
  });

  const memberIds = invitationStateQuery.data?.memberIds ?? [];
  const pendingInviteeIds = invitationStateQuery.data?.pendingInviteeIds ?? [];

  const performSearch = useCallback(
    async (query: string) => {
      if (!appointmentId) {
        setErrorMessage('약속 정보가 필요합니다.');
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
    [appointmentId],
  );

  const onSubmit = async (data: GroupSearchFormInput) => {
    await performSearch(data.query);
  };

  const updateInvitationStateCache = (
    updater: (prev: AppointmentInvitationStateData) => AppointmentInvitationStateData,
  ) => {
    if (!appointmentId) return;

    queryClient.setQueryData<AppointmentInvitationStateData>(
      appointmentKeys.invitationState(appointmentId),
      (prev) =>
        updater(
          prev ?? {
            memberIds: [],
            pendingInviteeIds: [],
          },
        ),
    );
  };

  const handleInvite = async (userId: string) => {
    if (!appointmentId) {
      setErrorMessage('약속 정보가 필요합니다.');
      return;
    }

    setIsInviting((prev) => ({ ...prev, [userId]: true }));
    setErrorMessage('');

    const result = await sendAppointmentInvitationAction(appointmentId, userId);

    setIsInviting((prev) => ({ ...prev, [userId]: false }));

    if (!result.ok) {
      if (result.error === 'invite-already-sent') {
        updateInvitationStateCache((prev) => ({
          ...prev,
          pendingInviteeIds: prev.pendingInviteeIds.includes(userId)
            ? prev.pendingInviteeIds
            : [...prev.pendingInviteeIds, userId],
        }));
        return;
      }

      if (result.error === 'already-member') {
        updateInvitationStateCache((prev) => ({
          ...prev,
          memberIds: prev.memberIds.includes(userId)
            ? prev.memberIds
            : [...prev.memberIds, userId],
        }));
        return;
      }

      setErrorMessage(result.message || '초대에 실패했습니다.');
      return;
    }

    updateInvitationStateCache((prev) => ({
      ...prev,
      pendingInviteeIds: prev.pendingInviteeIds.includes(userId)
        ? prev.pendingInviteeIds
        : [...prev.pendingInviteeIds, userId],
    }));
  };

  return (
    <>
      <form className={searchBlock} onSubmit={handleSubmit(onSubmit)}>
        <label className={searchLabel} htmlFor="query">
          닉네임 검색
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
          const isMember = memberIds.includes(user.userId);
          const isInvited = pendingInviteeIds.includes(user.userId);
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
                  ? '약속 멤버'
                  : isInvited
                    ? '초대 완료'
                    : isLoading
                      ? '전송 중'
                      : '초대하기'}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
