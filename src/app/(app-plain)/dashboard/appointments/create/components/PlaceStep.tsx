import { KakaoMapPreview } from '@/components/kakao/KakaoMapPreview';

import {
  emptyResult,
  helperText,
  inputLabel,
  locationButton,
  locationError,
  locationHint,
  locationInfo,
  locationRow,
  locationTitle,
  mapWrapper,
  primaryButton,
  resultAddress,
  resultInfo,
  resultItem,
  resultName,
  results,
  searchButton,
  searchRow,
  section,
  selectedTag,
  stepTitle,
  underlineInput,
} from './PlaceStep.css';
import { container } from '../page.css';

import type { PlaceSummary } from '@/actions/place';
import type { FormEvent } from 'react';

interface PlaceStepProps {
  placeQuery: string;
  placeResults: PlaceSummary[];
  selectedPlace: PlaceSummary | null;
  isPlaceSearched: boolean;
  errorMessage: string;
  locationMessage: string;
  locationErrorMessage: string;
  isLocating: boolean;
  hasLocation: boolean;
  onQueryChange: (value: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSelectPlace: (place: PlaceSummary) => void;
  onRequestLocation: () => void;
  onNext: () => void;
}

export function PlaceStep({
  placeQuery,
  placeResults,
  selectedPlace,
  isPlaceSearched,
  errorMessage,
  locationMessage,
  locationErrorMessage,
  isLocating,
  hasLocation,
  onQueryChange,
  onSearchSubmit,
  onSelectPlace,
  onRequestLocation,
  onNext,
}: PlaceStepProps) {
  const locationButtonLabel = isLocating
    ? '위치 확인 중...'
    : hasLocation
      ? '위치 갱신'
      : '허용하기';

  return (
    <div className={container}>
      <button className={primaryButton} onClick={onNext}>
        다음
      </button>
      <div className={stepTitle}>약속 장소를 검색해주세요</div>
      <div className={locationRow}>
        <div className={locationInfo}>
          <div className={locationTitle}>현재 위치 사용</div>
          <div className={locationHint}>{locationMessage}</div>
          {locationErrorMessage && (
            <div className={locationError}>{locationErrorMessage}</div>
          )}
        </div>
        <button
          type="button"
          className={locationButton}
          onClick={onRequestLocation}
          disabled={isLocating}>
          {locationButtonLabel}
        </button>
      </div>
      <div className={section}>
        <label className={inputLabel} htmlFor="appointment-place">
          장소 검색
        </label>
        <form className={searchRow} onSubmit={onSearchSubmit}>
          <input
            id="appointment-place"
            className={underlineInput}
            value={placeQuery}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="장소를 검색하세요"
          />
          <button type="submit" className={searchButton}>
            검색
          </button>
        </form>
      </div>
      <div className={helperText}>{errorMessage}</div>
      {selectedPlace && (
        <div className={mapWrapper}>
          <KakaoMapPreview
            latitude={selectedPlace.latitude}
            longitude={selectedPlace.longitude}
            title={selectedPlace.name}
            address={selectedPlace.roadAddress || selectedPlace.address}
          />
        </div>
      )}

      <div className={results}>
        {placeResults.map((place) => {
          const isSelected = selectedPlace?.kakaoId === place.kakaoId;
          const address = place.roadAddress || place.address;
          return (
            <div key={place.kakaoId}>
              <button
                type="button"
                className={resultItem}
                onClick={() => onSelectPlace(place)}>
                <div className={resultInfo}>
                  <div className={resultName}>{place.name}</div>
                  <div className={resultAddress}>{address}</div>
                </div>
                {isSelected && <span className={selectedTag}>선택됨</span>}
              </button>
            </div>
          );
        })}
        {isPlaceSearched && placeResults.length === 0 && (
          <div className={emptyResult}>검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
