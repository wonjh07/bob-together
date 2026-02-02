'use client';

import { useEffect } from 'react';

import { loadKakaoMapScript } from '@/libs/kakao/loadKakaoMapScript';

export function KakaoMapPreload() {
  useEffect(() => {
    loadKakaoMapScript().catch((err: Error) => {
      console.error('[KakaoMap] Preload failed:', err);
    });
  }, []);

  return null;
}
