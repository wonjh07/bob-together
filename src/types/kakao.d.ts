export {};

declare global {
  interface Window {
    kakao?: {
      maps?: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => {
          getLat: () => number;
          getLng: () => number;
        };
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level?: number },
        ) => unknown;
        Marker: new (options: { position: unknown; map: unknown }) => unknown;
        InfoWindow: new (options: {
          content: string;
          disableAutoPan?: boolean;
        }) => {
          open: (map: unknown, marker: unknown) => void;
        };
      };
    };
  }
}
