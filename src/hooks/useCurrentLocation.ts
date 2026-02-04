'use client';

import { useState } from 'react';

export function useCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const requestLocation = () => {
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

  return { currentLocation, isLocating, locationError, requestLocation };
}
