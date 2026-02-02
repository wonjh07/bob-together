const SCRIPT_ID = 'kakao-map-sdk';

export function loadKakaoMapScript(): Promise<void> {
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

  if (!appKey) {
    if (typeof window !== 'undefined') {
      console.error('[KakaoMap] Missing NEXT_PUBLIC_KAKAO_MAP_APP_KEY');
    }
    return Promise.reject(new Error('missing-kakao-map-app-key'));
  }

  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.kakao?.maps?.LatLng) {
    return Promise.resolve();
  }

  const existingScript = document.getElementById(SCRIPT_ID);

  if (existingScript) {
    return new Promise((resolve, reject) => {
      const handleReady = () => {
        if (window.kakao?.maps?.load) {
          window.kakao.maps.load(() => resolve());
          return;
        }
        if (window.kakao?.maps?.LatLng) {
          resolve();
          return;
        }
        reject(new Error('kakao-map-not-ready'));
      };

      existingScript.addEventListener('load', handleReady);
      existingScript.addEventListener('error', () => {
        console.error('[KakaoMap] Script load failed');
        reject(new Error('kakao-map-script-error'));
      });

      if (window.kakao?.maps?.load || window.kakao?.maps?.LatLng) {
        handleReady();
      }
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(() => resolve());
        return;
      }
      if (window.kakao?.maps?.LatLng) {
        resolve();
        return;
      }
      reject(new Error('kakao-map-not-ready'));
    };
    script.onerror = () => {
      console.error('[KakaoMap] Script load failed', script.src);
      reject(new Error('kakao-map-script-error'));
    };
    document.head.appendChild(script);
  });
}
