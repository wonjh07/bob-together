'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import PlainTopNav from '@/components/ui/PlainTopNav';
import SearchInput from '@/components/ui/SearchInput';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { usePlaceSearch } from '@/hooks/usePlaceSearch';

import * as styles from './page.css';

import type { PlaceSummary } from '@/actions/place';

interface AppointmentEditPlaceClientProps {
  appointmentId: string;
}

export default function AppointmentEditPlaceClient({
  appointmentId,
}: AppointmentEditPlaceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  const { currentLocation, isLocating, locationError, requestLocation } =
    useCurrentLocation();
  const {
    placeQuery,
    setPlaceQuery,
    placeResults,
    isPlaceSearched,
    setIsPlaceSearched,
    handlePlaceSearchSubmit,
  } = usePlaceSearch({
    currentLocation,
    setErrorMessage,
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (!q) return;
    setPlaceQuery(q);
    setIsPlaceSearched(false);
  }, [searchParams, setPlaceQuery, setIsPlaceSearched]);

  const hasLocation = Boolean(currentLocation);
  const locationButtonLabel = isLocating
    ? '위치 확인 중...'
    : hasLocation
      ? '위치 갱신'
      : '허용하기';

  const handleSelectPlace = (place: PlaceSummary) => {
    const params = new URLSearchParams();
    params.set('placeName', place.name);
    params.set('placeAddress', place.roadAddress || place.address);
    params.set('placeCategory', place.category || '');
    params.set('placeLatitude', String(place.latitude));
    params.set('placeLongitude', String(place.longitude));
    params.set('placeKakaoId', place.kakaoId);

    const title = searchParams.get('title');
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    if (title) params.set('title', title);
    if (date) params.set('date', date);
    if (startTime) params.set('startTime', startTime);
    if (endTime) params.set('endTime', endTime);

    router.push(`/dashboard/appointments/${appointmentId}/edit?${params.toString()}`);
  };

  return (
    <div className={styles.page}>
      <PlainTopNav
        title="장소 검색"
        onBack={() => router.back()}
        rightHidden
      />
      <div className={styles.content}>
        <div className={styles.locationRow}>
          <div className={styles.locationTitle}>현재 위치 사용</div>
          <button
            type="button"
            className={styles.locationButton}
            onClick={requestLocation}
            disabled={isLocating}>
            {locationButtonLabel}
          </button>
        </div>
        <div className={styles.helperText}>
          {locationError || errorMessage || ''}
        </div>

        <form className={styles.searchForm} onSubmit={handlePlaceSearchSubmit}>
          <SearchInput
            value={placeQuery}
            onValueChange={(value) => {
              setPlaceQuery(value);
              setIsPlaceSearched(false);
            }}
            placeholder="장소를 검색하세요"
          />
        </form>

        <div className={styles.results}>
          {placeResults.map((place) => {
            const address = place.roadAddress || place.address;
            return (
              <div key={place.kakaoId} className={styles.resultItem}>
                <div className={styles.resultInfo}>
                  <p className={styles.resultName}>{place.name}</p>
                  <p className={styles.resultAddress}>{address}</p>
                </div>
                <button
                  type="button"
                  className={styles.selectButton}
                  onClick={() => handleSelectPlace(place)}>
                  선택
                </button>
              </div>
            );
          })}

          {isPlaceSearched && placeResults.length === 0 ? (
            <div className={styles.emptyResult}>검색 결과가 없습니다.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
