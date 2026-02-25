'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { CreateAppointmentProvider } from '@/app/dashboard/(plain)/appointments/create/providers';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { createMyGroupsQueryOptions } from '@/libs/query/groupQueries';
import { getDefaultDateTimeValues } from '@/utils/dateTime';

import { CompleteStep } from './_components/CompleteStep';
import { ConfirmStep } from './_components/ConfirmStep';
import { DateTimeStep } from './_components/DateTimeStep';
import { GroupStep } from './_components/GroupStep';
import { PlaceStep } from './_components/PlaceStep';
import { TitleStep } from './_components/TitleStep';
import { formContainer } from './MultiStepFormClient.css';
import { appointmentCreateFormSchema } from './types';

import type { CreateAppointmentForm } from './types';

type Step = 'group' | 'title' | 'datetime' | 'place' | 'confirm' | 'complete';

type MultiStepFormClientProps = {
  initialGroupId: string | null;
};

function MultiStepFormClientContent() {
  const [step, setStep] = useState<Step>('group');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const router = useRouter();
  const { date, startTime, endTime } = getDefaultDateTimeValues();

  const methods = useForm<CreateAppointmentForm>({
    defaultValues: {
      groupId: null,
      title: '',
      date,
      startTime,
      endTime,
      place: null,
    },
    resolver: zodResolver(appointmentCreateFormSchema),
    mode: 'onSubmit',
  });

  const goBack = () => {
    if (step === 'group') {
      router.back();
      return;
    }
    if (step === 'title') setStep('group');
    if (step === 'datetime') setStep('title');
    if (step === 'place') setStep('datetime');
    if (step === 'confirm') setStep('place');
  };

  const handleNavNext = async () => {
    if (step === 'group') {
      const groupId = methods.getValues('groupId');
      if (!groupId) {
        methods.setError('groupId', { message: '그룹을 선택해주세요.' });
        return;
      }
      methods.clearErrors('groupId');
      setStep('title');
      return;
    }

    if (step === 'title') {
      const isValid = await methods.trigger('title');
      if (!isValid) return;
      setStep('datetime');
      return;
    }

    if (step === 'datetime') {
      const isValid = await methods.trigger(['date', 'startTime', 'endTime']);
      if (!isValid) return;
      setStep('place');
      return;
    }

    if (step === 'place') {
      const place = methods.getValues('place');
      if (!place) {
        methods.setError('place', { message: '장소를 선택해주세요.' });
        return;
      }
      methods.clearErrors('place');
      setStep('confirm');
    }
  };

  return (
    <FormProvider {...methods}>
      {step !== 'complete' ? (
        <PlainTopNav
          title="새 약속 만들기"
          onBack={goBack}
          rightLabel="다음"
          onRightAction={() => {
            void handleNavNext();
          }}
          rightHidden={step === 'confirm'}
        />
      ) : null}
      <div className={formContainer}>
        {step === 'group' && <GroupStep />}

        {step === 'title' && <TitleStep />}

        {step === 'datetime' && <DateTimeStep />}

        {step === 'place' && <PlaceStep />}

        {step === 'confirm' && (
          <ConfirmStep
            onCreated={(nextAppointmentId) => {
              setAppointmentId(nextAppointmentId);
              setStep('complete');
            }}
          />
        )}

        {step === 'complete' && <CompleteStep appointmentId={appointmentId} />}
      </div>
    </FormProvider>
  );
}

export default function MultiStepFormClient({
  initialGroupId,
}: MultiStepFormClientProps) {
  const { data: groups = [], isLoading } = useQuery(
    createMyGroupsQueryOptions(),
  );

  return (
    <CreateAppointmentProvider
      groups={groups}
      initialGroupId={initialGroupId}
      isLoading={isLoading}>
      <MultiStepFormClientContent />
    </CreateAppointmentProvider>
  );
}
