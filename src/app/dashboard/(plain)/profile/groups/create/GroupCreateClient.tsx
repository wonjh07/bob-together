'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { createGroupAction } from '@/actions/group';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useRequestErrorPresenter } from '@/hooks/useRequestErrorPresenter';
import { invalidateGroupMembershipQueries } from '@/libs/query/invalidateGroupQueries';
import { groupFormSchema } from '@/schemas/group';

import * as styles from './page.css';

import type { GroupFormInput } from '@/schemas/group';

export default function GroupCreateClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const {
    openRequestError,
  } = useRequestErrorPresenter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormInput>({
    resolver: zodResolver(groupFormSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: GroupFormInput) => {
    const result = await createGroupAction(data.groupName);

    if (!result.ok) {
      openRequestError(result.message || '그룹 생성에 실패했습니다.', {
        err: result,
        source: 'GroupCreateClient.onSubmit.result',
      });
      return;
    }

    if (!result.data) {
      openRequestError('그룹 정보를 확인할 수 없습니다.', {
        err: result,
        source: 'GroupCreateClient.onSubmit.noData',
      });
      return;
    }

    await invalidateGroupMembershipQueries(queryClient);
    toast.success('그룹을 생성했습니다.');
    const fromOnboarding = searchParams.get('from') === 'onboarding';
    const memberPath = fromOnboarding
      ? `/dashboard/profile/groups/${result.data.groupId}/members?from=onboarding`
      : `/dashboard/profile/groups/${result.data.groupId}/members`;
    router.replace(memberPath);
  };

  return (
    <div className={styles.page}>
      <PlainTopNav
        title="그룹 생성"
        backHref="/dashboard/profile/groups"
        rightHidden
      />
      <div className={styles.content}>
        <h2 className={styles.title}>그룹명을 입력해주세요</h2>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.row}>
            <input
              id="group-name"
              className={styles.input}
              placeholder="그룹명"
              disabled={isSubmitting}
              {...register('groupName')}
            />
            <button
              type="submit"
              className={styles.submit}
              disabled={isSubmitting}>
              {isSubmitting ? '생성 중' : '생성'}
            </button>
          </div>
          <div className={styles.helperText}>
            {errors.groupName?.message || ''}
          </div>
        </form>
      </div>    </div>
  );
}
