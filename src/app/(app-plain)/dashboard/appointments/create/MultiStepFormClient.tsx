'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { createMyGroupsQueryOptions } from '@/libs/query/groupQueries';
import { CreateAppointmentProvider } from '@/provider/create-appointment-context';
import { getDefaultDateTimeValues } from '@/utils/dateTime';

import { CompleteStep } from './_components/CompleteStep';
import { ConfirmStep } from './_components/ConfirmStep';
import { DateTimeStep } from './_components/DateTimeStep';
import { GroupStep } from './_components/GroupStep';
import { PlaceStep } from './_components/PlaceStep';
import { TitleStep } from './_components/TitleStep';
import { formContainer, movebackContainer } from './MultiStepFormClient.css';
import { appointmentCreateFormSchema } from './types';

import type { CreateAppointmentForm } from './types';

import { movebackButton } from '@/components/ui/BackButton.css';

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

  return (
    <FormProvider {...methods}>
      {step !== 'complete' && (
        <div className={movebackContainer}>
          <button className={movebackButton} onClick={goBack} type="button">
            &lt;
          </button>
        </div>
      )}
      <div className={formContainer}>
        {step === 'group' && <GroupStep onNext={() => setStep('title')} />}

        {step === 'title' && <TitleStep onNext={() => setStep('datetime')} />}

        {step === 'datetime' && (
          <DateTimeStep onNext={() => setStep('place')} />
        )}

        {step === 'place' && <PlaceStep onNext={() => setStep('confirm')} />}

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
