'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { joinGroupAction, searchGroupsWithCountAction } from '@/actions/group';
import PlainTopNav from '@/components/ui/PlainTopNav';
import SearchInput from '@/components/ui/SearchInput';
import { invalidateGroupMembershipQueries } from '@/libs/query/invalidateGroupQueries';
import { groupSearchFormSchema } from '@/schemas/group';

import * as styles from './page.css';

import type { GroupSearchItem } from '@/actions/group';
import type { GroupSearchFormInput } from '@/schemas/group';

export default function GroupFindClient() {
  const queryClient = useQueryClient();
  const [groups, setGroups] = useState<GroupSearchItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GroupSearchFormInput>({
    defaultValues: {
      query: '',
    },
    resolver: zodResolver(groupSearchFormSchema),
    mode: 'onChange',
  });

  const performSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setGroups([]);
      setIsSearched(false);
      return;
    }

    setErrorMessage('');
    setIsSearched(false);

    const result = await searchGroupsWithCountAction({
      query: trimmedQuery,
      limit: 20,
    });

    if (!result.ok) {
      setErrorMessage(result.message || '그룹 검색에 실패했습니다.');
      return;
    }

    if (!result.data) {
      setErrorMessage('그룹 검색 결과를 불러오지 못했습니다.');
      return;
    }

    setGroups(result.data.groups);
    setIsSearched(true);
  }, []);

  const onSubmit = async (data: GroupSearchFormInput) => {
    await performSearch(data.query);
  };

  const handleJoin = async (groupId: string) => {
    if (joiningGroupId) return;

    setJoiningGroupId(groupId);
    setErrorMessage('');
    const result = await joinGroupAction(groupId);
    setJoiningGroupId(null);

    if (!result.ok) {
      if (result.error === 'already-member') {
        setGroups((prev) =>
          prev.map((group) =>
            group.groupId === groupId ? { ...group, isMember: true } : group,
          ),
        );
        return;
      }

      setErrorMessage(result.message || '그룹 가입에 실패했습니다.');
      return;
    }

    setGroups((prev) =>
      prev.map((group) =>
        group.groupId === groupId ? { ...group, isMember: true } : group,
      ),
    );
    await invalidateGroupMembershipQueries(queryClient);
    toast.success('그룹에 가입했습니다.');
  };

  return (
    <div className={styles.page}>
      <PlainTopNav
        title="그룹 찾기"
        backHref="/dashboard/profile/groups"
        rightHidden
      />
      <div className={styles.content}>
        <form className={styles.searchBlock} onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="query"
            render={({ field }) => (
              <SearchInput
                value={field.value ?? ''}
                onValueChange={field.onChange}
                placeholder="그룹명을 입력하세요"
                inputId="group-query"
                disabled={isSubmitting}
                submitDisabled={isSubmitting}
              />
            )}
          />
          <div className={styles.helperText}>
            {errors.query?.message || errorMessage}
          </div>
        </form>

        <div className={styles.results}>
          {groups.map((group) => {
            const isJoining = joiningGroupId === group.groupId;
            const isDisabled = group.isMember || isJoining;

            return (
              <div key={group.groupId} className={styles.resultItem}>
                <div className={styles.resultInfo}>
                  <div className={styles.resultName}>{group.title}</div>
                  <div className={styles.resultSub}>
                    {group.name} · 멤버 {group.memberCount}명
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.joinButton} ${
                    group.isMember ? styles.joinedButton : ''
                  }`}
                  onClick={() => handleJoin(group.groupId)}
                  disabled={isDisabled}>
                  {group.isMember
                    ? '가입 완료'
                    : isJoining
                      ? '가입 중'
                      : '가입하기'}
                </button>
              </div>
            );
          })}
          {isSearched && groups.length === 0 ? (
            <div className={styles.emptyResult}>검색 결과가 없습니다.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
