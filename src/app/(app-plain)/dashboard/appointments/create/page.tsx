'use client';

import { useCallback, useMemo, useState } from 'react';

import { createAppointmentAction } from '@/actions/appointment';
import { searchPlacesAction } from '@/actions/place';

import { useCreateAppointmentContext } from './create-appointment-context';
import { headerRow, page, panel } from './page.css';
import { CompleteStep } from './steps/CompleteStep';
import { ConfirmStep } from './steps/ConfirmStep';
import { DateTimeStep } from './steps/DateTimeStep';
import { PlaceStep } from './steps/PlaceStep';
import { TitleStep } from './steps/TitleStep';

import type { PlaceSummary } from '@/actions/place';

import { movebackButton } from '@/components/ui/moveback.css';
import { useRouter } from 'next/navigation';

type Step = 'title' | 'datetime' | 'place' | 'confirm' | 'complete';

export default function AppointmentCreatePage() {
  const { groups, currentGroupId } = useCreateAppointmentContext();
  const [step, setStep] = useState<Step>('title');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceSummary[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSummary | null>(null);
  const [isPlaceSearched, setIsPlaceSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
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

  const runPlaceSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setPlaceResults([]);
        setIsPlaceSearched(false);
        return;
      }

      setIsPlaceSearched(true);
      const result = await searchPlacesAction({
        query: trimmed,
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
        radius: currentLocation ? 5000 : undefined,
      });
      if (!result.ok) {
        setErrorMessage(result.message || '장소 검색에 실패했습니다.');
        return;
      }

      if (!result.data) {
        setErrorMessage('검색 결과를 불러올 수 없습니다.');
        return;
      }

      setPlaceResults(result.data.places);
    },
    [currentLocation],
  );

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저에서는 위치 정보를 사용할 수 없습니다.');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('위치 권한이 필요합니다.');
        } else {
          setLocationError('현재 위치를 가져오지 못했습니다.');
        }
        setIsLocating(false);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60000,
        timeout: 10000,
      },
    );
  };

  const handlePlaceSearch = async () => {
    setErrorMessage('');
    await runPlaceSearch(placeQuery);
  };

  const handlePlaceSearchSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    await handlePlaceSearch();
  };

  const goBack = () => {
    setErrorMessage('');
    if (step === 'title') {
      router.back();
      return;
    }
    if (step === 'datetime') setStep('title');
    if (step === 'place') setStep('datetime');
    if (step === 'confirm') setStep('place');
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
      groupId: currentGroupId ?? undefined,
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
    <div className={page}>
      {step !== 'complete' && (
        <div className={headerRow}>
          <button className={movebackButton} onClick={goBack} type="button">
            &lt;
          </button>
        </div>
      )}
      <div className={panel}>
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
    </div>
  );
}
