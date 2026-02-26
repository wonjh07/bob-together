'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import {
  searchAppointmentInvitableUsersAction,
  sendAppointmentInvitationAction,
} from '@/actions/appointment';
import PlainTopNav from '@/components/ui/PlainTopNav';
import SearchInput from '@/components/ui/SearchInput';
import {
  createAppointmentInvitationStateQueryOptions,
  type AppointmentInvitationStateData,
} from '@/libs/query/appointmentQueries';
import { useQueryScope } from '@/provider/query-scope-provider';
import { groupSearchFormSchema } from '@/schemas/group';

import {
  invitationPage,
  invitationPanel,
  headerMeta,
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

import type { AppointmentInviteeSummary } from '@/actions/appointment';
import type { GroupSearchFormInput } from '@/schemas/group';

type AppointmentInvitationClientProps = {
  appointmentId: string;
  appointmentTitle: string;
  completeHref: string;
};

export default function AppointmentInvitationClient({
  appointmentId,
  appointmentTitle,
  completeHref,
}: AppointmentInvitationClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryScope = useQueryScope();
  const [resultUsers, setResultUsers] = useState<AppointmentInviteeSummary[]>([]);
  const [isSearched, setIsSearched] = useState(false);
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

  const invitationStateQueryOptions = createAppointmentInvitationStateQueryOptions(
    appointmentId,
    queryScope,
  );
  const invitationStateQuery = useQuery({
    ...invitationStateQueryOptions,
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
        setIsSearched(false);
        return;
      }

      setIsSearching(true);
      setErrorMessage('');
      setIsSearched(false);
      const result = await searchAppointmentInvitableUsersAction({
        appointmentId,
        query: trimmedQuery,
      });
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
      setIsSearched(true);
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
      invitationStateQueryOptions.queryKey,
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

  const handleComplete = () => {
    toast.success('약속 초대를 완료했습니다.');
    router.push(completeHref);
  };

  return (
    <div className={invitationPage}>
      <PlainTopNav
        title="그룹원 초대"
        rightLabel="완료"
        rightAriaLabel="초대 완료"
        onRightAction={handleComplete}
      />
      <div className={invitationPanel}>
        {appointmentTitle ? (
          <div className={headerMeta}>{appointmentTitle}</div>
        ) : null}
        <div className={headerDescription}>그룹원을 검색하고 초대해주세요</div>
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
          {isSearched && !isSearching && resultUsers.length === 0 ? (
            <div className={emptyResult}>검색 결과가 없습니다.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
