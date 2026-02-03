'use client';

import { useEffect, useRef } from 'react';

import { useKakaoMap } from '@/hooks/useKakaoMap';

import { mapFrame, mapContainer, mapPlaceholder } from './kakaoMapPreview.css';

interface KakaoMapPreviewProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string | null;
}

export function KakaoMapPreview({
  latitude,
  longitude,
  title,
  address,
}: KakaoMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isReady, error } = useKakaoMap();

  useEffect(() => {
    if (!isReady || !mapRef.current || !window.kakao?.maps) return;

    const container = mapRef.current;
    // Clear previous map layers to prevent overlap during fast switching.
    container.replaceChildren();

    window.kakao.maps.load(() => {
      if (!mapRef.current || !window.kakao?.maps?.LatLng) {
        console.error('[KakaoMap] LatLng not ready');
        return;
      }

      const center = new window.kakao.maps.LatLng(latitude, longitude);
      const map = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 4,
      });

      const marker = new window.kakao.maps.Marker({
        position: center,
        map,
      });

      const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeAddress = (address || '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const content = `<div style="padding:4px 6px;font-size:12px;color:#b7470b;">
        <div style="font-weight:700;margin-bottom:4px;">${safeTitle}</div>
        ${safeAddress ? `<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${safeAddress}</div>` : ''}
      </div>`;

      const infoWindow = new window.kakao.maps.InfoWindow({
        content,
        disableAutoPan: true,
      });

      infoWindow.open(map, marker);
    });

    return () => {
      container.replaceChildren();
    };
  }, [isReady, latitude, longitude, title, address]);

  if (error) {
    return (
      <div className={mapFrame}>
        <div className={mapPlaceholder}>지도를 불러올 수 없습니다.</div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className={mapFrame}>
        <div className={mapPlaceholder}>지도 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={mapFrame}>
      <div ref={mapRef} className={mapContainer} />
    </div>
  );
}
