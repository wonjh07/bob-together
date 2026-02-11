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
          options: {
            center: unknown;
            level?: number;
            draggable?: boolean;
            scrollwheel?: boolean;
          },
        ) => {
          setZoomable: (zoomable: boolean) => void;
        };
        Marker: new (options: { position: unknown; map: unknown }) => unknown;
        InfoWindow: new (options: {
          content: string;
          disableAutoPan?: boolean;
        }) => {
          open: (map: unknown, marker: unknown) => void;
        };
        event: {
          addListener: (
            target: unknown,
            type: string,
            handler: (...args: unknown[]) => void,
          ) => void;
          preventMap: () => void;
        };
      };
    };
  }
}
