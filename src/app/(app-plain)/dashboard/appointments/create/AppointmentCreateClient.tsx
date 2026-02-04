'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { createAppointmentAction } from '@/actions/appointment';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { usePlaceSearch } from '@/hooks/usePlaceSearch';
import { useCreateAppointmentContext } from '@/provider/create-appointment-context';

import { CompleteStep } from './_components/CompleteStep';
import { ConfirmStep } from './_components/ConfirmStep';
import { DateTimeStep } from './_components/DateTimeStep';
import { GroupStep } from './_components/GroupStep';
import { PlaceStep } from './_components/PlaceStep';
import { TitleStep } from './_components/TitleStep';
import { headerRow, panel } from './page.css';

import { movebackButton } from '@/components/ui/moveback.css';

type Step = 'group' | 'title' | 'datetime' | 'place' | 'confirm' | 'complete';

export default function AppointmentCreateClient() {
  const { groups, currentGroupId, setCurrentGroupId } =
    useCreateAppointmentContext();
  const [step, setStep] = useState<Step>('group');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { currentLocation, isLocating, locationError, requestLocation } =
    useCurrentLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const router = useRouter();

  const currentGroupName = useMemo(() => {
    if (!currentGroupId) {
      return groups.length > 0 ? groups[0].name : '그룹 선택';
    }
    const found = groups.find((group) => group.groupId === currentGroupId);
    return found?.name || '그룹 선택';
  }, [groups, currentGroupId]);

  const handleRequestLocation = requestLocation;

  const {
    placeQuery,
    setPlaceQuery,
    placeResults,
    selectedPlace,
    setSelectedPlace,
    isPlaceSearched,
    setIsPlaceSearched,
    handlePlaceSearchSubmit,
  } = usePlaceSearch({
    currentLocation,
    setErrorMessage,
  });

  const goBack = () => {
    setErrorMessage('');
    if (step === 'group') {
      router.back();
      return;
    }
    if (step === 'title') setStep('group');
    if (step === 'datetime') setStep('title');
    if (step === 'place') setStep('datetime');
    if (step === 'confirm') setStep('place');
  };

  const handleGroupNext = () => {
    if (!currentGroupId) {
      setErrorMessage('그룹을 선택해주세요.');
      return;
    }
    setErrorMessage('');
    setStep('title');
  };

  const handleTitleNext = () => {
    if (!title.trim()) {
      setErrorMessage('약속 제목을 입력해주세요.');
      return;
    }
    setErrorMessage('');
    setStep('datetime');
  };

  const handleDateNext = () => {
    if (!date || !startTime || !endTime) {
      setErrorMessage('약속 날짜와 시간을 입력해주세요.');
      return;
    }

    if (endTime <= startTime) {
      setErrorMessage('종료 시간이 시작 시간보다 늦어야 합니다.');
      return;
    }

    setErrorMessage('');
    setStep('place');
  };

  const handlePlaceNext = () => {
    if (!selectedPlace) {
      setErrorMessage('장소를 선택해주세요.');
      return;
    }
    setErrorMessage('');
    setStep('confirm');
  };

  const handleCreate = async () => {
    if (!currentGroupId) {
      setErrorMessage('그룹을 선택해주세요.');
      return;
    }
    if (!selectedPlace) {
      setErrorMessage('장소를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const result = await createAppointmentAction({
      title: title.trim(),
      date,
      startTime,
      endTime,
      place: selectedPlace,
      groupId: currentGroupId,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message || '약속 생성 중 오류가 발생했습니다.');
      return;
    }

    if (!result.data) {
      setErrorMessage('약속 정보를 확인할 수 없습니다.');
      return;
    }

    setAppointmentId(result.data.appointmentId);
    setStep('complete');
  };

  const locationMessage = currentLocation
    ? '현재 위치 기준으로 가까운 순으로 검색됩니다.'
    : '현재 위치를 허용하면 가까운 순으로 정렬됩니다.';

  return (
    <>
      {step !== 'complete' && (
        <div className={headerRow}>
          <button className={movebackButton} onClick={goBack} type="button">
            &lt;
          </button>
        </div>
      )}
      <div className={panel}>
        {step === 'group' && (
          <GroupStep
            groups={groups}
            currentGroupId={currentGroupId}
            currentGroupName={currentGroupName}
            errorMessage={errorMessage}
            onSelectGroup={setCurrentGroupId}
            onNext={handleGroupNext}
          />
        )}

        {step === 'title' && (
          <TitleStep
            title={title}
            errorMessage={errorMessage}
            onTitleChange={setTitle}
            onNext={handleTitleNext}
          />
        )}

        {step === 'datetime' && (
          <DateTimeStep
            date={date}
            startTime={startTime}
            endTime={endTime}
            errorMessage={errorMessage}
            onDateChange={setDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onNext={handleDateNext}
          />
        )}

        {step === 'place' && (
          <PlaceStep
            placeQuery={placeQuery}
            placeResults={placeResults}
            selectedPlace={selectedPlace}
            isPlaceSearched={isPlaceSearched}
            errorMessage={errorMessage}
            locationMessage={locationMessage}
            locationErrorMessage={locationError}
            isLocating={isLocating}
            hasLocation={Boolean(currentLocation)}
            onQueryChange={(value) => {
              setPlaceQuery(value);
              setIsPlaceSearched(false);
            }}
            onSearchSubmit={handlePlaceSearchSubmit}
            onSelectPlace={setSelectedPlace}
            onRequestLocation={handleRequestLocation}
            onNext={handlePlaceNext}
          />
        )}

        {step === 'confirm' && selectedPlace && (
          <ConfirmStep
            title={title}
            date={date}
            startTime={startTime}
            endTime={endTime}
            currentGroupName={currentGroupName}
            selectedPlace={selectedPlace}
            errorMessage={errorMessage}
            isSubmitting={isSubmitting}
            onCreate={handleCreate}
          />
        )}

        {step === 'complete' && (
          <CompleteStep
            title={title}
            date={date}
            startTime={startTime}
            endTime={endTime}
            appointmentId={appointmentId}
          />
        )}
      </div>
    </>
  );
}
