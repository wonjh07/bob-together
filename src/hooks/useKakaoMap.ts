import { useEffect, useState } from 'react';

import { loadKakaoMapScript } from '@/libs/kakao/loadKakaoMapScript';

export function useKakaoMap() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    loadKakaoMapScript()
      .then(() => {
        if (!isActive) return;
        setIsReady(true);
        setError(null);
      })
      .catch((err: Error) => {
        if (!isActive) return;
        console.error('[KakaoMap] Load failed:', err);
        setError(err.message);
        setIsReady(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { isReady, error };
}
