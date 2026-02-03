'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { searchGroupsAction } from '@/actions/group';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { groupSearchFormSchema } from '@/schemas/group';

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
  results,
  resultItem,
  resultName,
  resultButton,
  emptyResult,
} from './page.css';
import { useOnboardingLayout } from '@/provider/layout-context';

import type { GroupSummary } from '@/actions/group';
import type { GroupSearchFormInput } from '@/schemas/group';

export default function GroupJoinPage() {
  const router = useRouter();
  const { setShowMoveback } = useOnboardingLayout();
  const [errorMessage, setErrorMessage] = useState('');
  const [groupResults, setGroupResults] = useState<GroupSummary[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<GroupSearchFormInput>({
    resolver: zodResolver(groupSearchFormSchema),
    mode: 'onChange',
  });

  const queryValue = watch('query');
  const debouncedQuery = useDebouncedValue(queryValue, 500);

  useEffect(() => {
    setShowMoveback(true);
    return () => setShowMoveback(false);
  }, [setShowMoveback]);

  const performSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setGroupResults([]);
      setIsSearched(false);
      return;
    }

    setErrorMessage('');
    setIsSearched(false);
    const result = await searchGroupsAction(trimmedQuery);

    if (!result.ok) {
      setErrorMessage(result.message || '그룹을 찾을 수 없습니다.');
      return;
    }

    if (!result.data) {
      setErrorMessage('그룹 정보를 확인할 수 없습니다.');
      return;
    }

    setGroupResults(result.data.groups);
    setIsSearched(true);
  }, []);

  useEffect(() => {
    if (!debouncedQuery) {
      setGroupResults([]);
      setIsSearched(false);
      return;
    }

    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const onSubmit = async (data: GroupSearchFormInput) => {
    await performSearch(data.query);
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
              {...register('query')}
              className={lineInput}
              placeholder="그룹명을 입력하세요"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className={`${buttonBase} ${primaryButton} ${compactButton}`}
              disabled={isSubmitting}>
              검색하기
            </button>
          </div>
          <div className={helperText}>
            {errors.query?.message || errorMessage}
          </div>
        </form>

        <div className={results}>
          {groupResults.map((group) => (
            <div className={resultItem} key={group.groupId}>
              <div className={resultName}>{group.name}</div>
              <button
                type="button"
                className={resultButton}
                onClick={() =>
                  router.push(
                    `/group/join/confirm?groupId=${group.groupId}&groupName=${encodeURIComponent(
                      group.name,
                    )}`,
                  )
                }>
                가입하기
              </button>
            </div>
          ))}
          {isSearched && groupResults.length === 0 && (
            <div className={emptyResult}>검색 결과가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
