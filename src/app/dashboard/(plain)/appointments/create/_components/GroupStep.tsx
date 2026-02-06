'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { setSelectedGroupAction } from '@/actions/groupSelection';
import { useCreateAppointmentContext } from '@/app/dashboard/(plain)/appointments/create/providers';

import * as styles from './GroupStep.css';

import type { CreateAppointmentForm } from '../types';
import NextButton from './ui/NextButton';

type GroupStepProps = {
  onNext: () => void;
};

export function GroupStep({ onNext }: GroupStepProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { groups, initialGroupId, isLoading } = useCreateAppointmentContext();
  const {
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateAppointmentForm>();
  const groupId = watch('groupId');

  const currentGroupName = isLoading
    ? '그룹 불러오는 중...'
    : groups.length === 0
      ? '가입한 그룹이 없습니다.'
      : (groups.find((group) => group.groupId === groupId)?.name ??
        '그룹 선택');

  const handleSelectGroup = (groupId: string) => {
    setValue('groupId', groupId, { shouldDirty: true });
    clearErrors('groupId');
  };

  useEffect(() => {
    if (groupId) return;
    if (
      initialGroupId &&
      groups.some((group) => group.groupId === initialGroupId)
    ) {
      setValue('groupId', initialGroupId, { shouldDirty: false });
      return;
    }
    if (groups[0]) {
      setValue('groupId', groups[0].groupId, { shouldDirty: false });
    }
  }, [groupId, groups, initialGroupId, setValue]);

  const handleNext = () => {
    if (!groupId) {
      setError('groupId', { message: '그룹을 선택해주세요.' });
      return;
    }
    clearErrors('groupId');
    onNext();
  };

  return (
    <div className={styles.container}>
      <NextButton handleNext={handleNext} />
      <div className={styles.title}>어떤 그룹에 약속을 만들까요?</div>
      <div className={styles.dropdown}>
        <button
          type="button"
          className={styles.dropdownButton}
          onClick={() => setIsOpen((prev) => !prev)}>
          {currentGroupName}
          <span>▼</span>
        </button>
        {isOpen && (
          <div className={styles.dropdownMenu}>
            {groups.map((group) => {
              const isActive = group.groupId === groupId;
              return (
                <button
                  key={group.groupId}
                  type="button"
                  className={`${styles.dropdownItem} ${
                    isActive ? styles.dropdownItemActive : ''
                  }`}
                  onClick={() => {
                    handleSelectGroup(group.groupId);
                    setIsOpen(false);
                  }}>
                  {group.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className={styles.helperText}>
        {errors.groupId?.message?.toString() ??
          (isLoading
            ? '그룹을 불러오고 있어요.'
            : groups.length === 0
              ? '가입한 그룹이 없습니다.'
              : '')}
      </div>
    </div>
  );
}
