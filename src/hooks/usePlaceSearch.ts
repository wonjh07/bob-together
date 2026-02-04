'use client';

import { useCallback, useState } from 'react';

import { searchPlacesAction } from '@/actions/place';

import type { PlaceSummary } from '@/actions/place';

type UsePlaceSearchArgs = {
  currentLocation: { latitude: number; longitude: number } | null;
  setErrorMessage: (message: string) => void;
};

export function usePlaceSearch({
  currentLocation,
  setErrorMessage,
}: UsePlaceSearchArgs) {
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceSummary[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSummary | null>(null);
  const [isPlaceSearched, setIsPlaceSearched] = useState(false);

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
    [currentLocation, setErrorMessage],
  );

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

  return {
    placeQuery,
    setPlaceQuery,
    placeResults,
    selectedPlace,
    setSelectedPlace,
    isPlaceSearched,
    setIsPlaceSearched,
    runPlaceSearch,
    handlePlaceSearch,
    handlePlaceSearchSubmit,
  };
}
