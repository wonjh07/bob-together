import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { usePlaceSearch } from '@/hooks/usePlaceSearch';

import * as styles from './PlaceStep.css';
import NextButton from './ui/NextButton';

import type { CreateAppointmentForm } from '../types';

interface PlaceStepProps {
  onNext: () => void;
}

export function PlaceStep({ onNext }: PlaceStepProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const {
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateAppointmentForm>();
  const { currentLocation, isLocating, locationError, requestLocation } =
    useCurrentLocation();

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


  const hasLocation = Boolean(currentLocation);
  const locationButtonLabel = isLocating
    ? '위치 확인 중...'
    : hasLocation
      ? '위치 갱신'
      : '허용하기';

  const handleNext = () => {
    if (!selectedPlace) {
      setError('place', { message: '장소를 선택해주세요.' });
      return;
    }
    clearErrors('place');
    onNext();
  };

  useEffect(() => {
    if (!selectedPlace) return;
    setValue('place', selectedPlace, { shouldDirty: true });
    clearErrors('place');
  }, [selectedPlace, setValue, clearErrors]);

  return (
    <div className={styles.container}>
      <NextButton handleNext={handleNext} />
      <div className={styles.stepTitle}>약속 장소를 검색해주세요</div>
      <div className={styles.locationRow}>
        <div className={styles.locationInfo}>
          <div className={styles.locationTitle}>현재 위치 사용</div>
        </div>
        {locationError && (
          <div className={styles.locationError}>{locationError}</div>
        )}
        <button
          type="button"
          className={styles.locationButton}
          onClick={requestLocation}
          disabled={isLocating}>
          {locationButtonLabel}
        </button>
      </div>
      <div className={styles.section}>
        <label className={styles.inputLabel} htmlFor="appointment-place">
          장소 검색
        </label>
        <form className={styles.searchRow} onSubmit={handlePlaceSearchSubmit}>
          <input
            id="appointment-place"
            className={styles.underlineInput}
            value={placeQuery}
            onChange={(event) => {
              setPlaceQuery(event.target.value);
              setIsPlaceSearched(false);
            }}
            placeholder="장소를 검색하세요"
          />
          <button type="submit" className={styles.searchButton}>
            검색
          </button>
        </form>
      </div>
      <div className={styles.helperText}>
        {errorMessage || errors.place?.message?.toString() || ''}
      </div>
      {/* {selectedPlace && (
        <div className={styles.mapWrapper}>
          <KakaoMapPreview
            latitude={selectedPlace.latitude}
            longitude={selectedPlace.longitude}
            title={selectedPlace.name}
            address={selectedPlace.roadAddress || selectedPlace.address}
          />
        </div>
      )} */}

      <div className={styles.results}>
        {placeResults.map((place) => {
          const isSelected = selectedPlace?.kakaoId === place.kakaoId;
          const address = place.roadAddress || place.address;
          return (
            <div key={place.kakaoId}>
              <button
                type="button"
                className={styles.resultItem}
                onClick={() => setSelectedPlace(place)}>
                <div className={styles.resultInfo}>
                  <div className={styles.resultName}>{place.name}</div>
                  <div className={styles.resultAddress}>{address}</div>
                </div>
                {isSelected && (
                  <span className={styles.selectedTag}>선택됨</span>
                )}
              </button>
            </div>
          );
        })}
        {isPlaceSearched && placeResults.length === 0 && (
          <div className={styles.emptyResult}>검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
