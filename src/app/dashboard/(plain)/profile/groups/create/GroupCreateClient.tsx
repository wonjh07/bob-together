'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { createGroupAction } from '@/actions/group';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { invalidateGroupMembershipQueries } from '@/libs/query/invalidateGroupQueries';
import { groupFormSchema } from '@/schemas/group';

import * as styles from './page.css';

import type { GroupFormInput } from '@/schemas/group';

export default function GroupCreateClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormInput>({
    resolver: zodResolver(groupFormSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: GroupFormInput) => {
    setErrorMessage('');
    const result = await createGroupAction(data.groupName);

    if (!result.ok) {
      setErrorMessage(result.message || '그룹 생성에 실패했습니다.');
      return;
    }

    if (!result.data) {
      setErrorMessage('그룹 정보를 확인할 수 없습니다.');
      return;
    }

    await invalidateGroupMembershipQueries(queryClient);
    toast.success('그룹을 생성했습니다.');
    router.push(`/dashboard/profile/groups/${result.data.groupId}/members`);
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
              placeholder="그룹명을 입력하세요"
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
            {errors.groupName?.message || errorMessage}
          </div>
        </form>
      </div>
    </div>
  );
}
