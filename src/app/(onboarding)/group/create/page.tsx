'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { createGroupAction } from '@/actions/group';
import { groupFormSchema } from '@/schemas/group';

import {
  page,
  panel,
  buttonBase,
  primaryButton,
  helperText,
} from '../shared.css';
import {
  formTitle,
  form,
  fieldLabel,
  fieldRow,
  lineInput,
  compactButton,
} from './page.css';
import { useOnboardingLayout } from '@/provider/layout-context';

import type { GroupFormInput } from '@/schemas/group';

export default function GroupCreatePage() {
  const router = useRouter();
  const { setShowMoveback } = useOnboardingLayout();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<GroupFormInput>({
    resolver: zodResolver(groupFormSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    setShowMoveback(true);
    return () => setShowMoveback(false);
  }, [setShowMoveback]);

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

    router.push(
      `/group/create/complete?groupId=${result.data.groupId}&groupName=${encodeURIComponent(result.data.name)}`,
    );
  };

  return (
    <div className={page}>
      <div className={panel}>
        <div className={formTitle}>그룹명을 입력해주세요</div>
        <form className={form} onSubmit={handleSubmit(onSubmit)}>
          <label className={fieldLabel} htmlFor="groupName">
            그룹명
          </label>
          <div className={fieldRow}>
            <input
              id="groupName"
              {...register('groupName')}
              className={lineInput}
              placeholder="그룹명을 입력하세요"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className={`${buttonBase} ${primaryButton} ${compactButton}`}
              disabled={isSubmitting}>
              확인
            </button>
          </div>
          <div className={helperText}>
            {errors.groupName?.message || errorMessage}
          </div>
        </form>
      </div>
    </div>
  );
}
