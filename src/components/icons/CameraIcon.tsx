import type { SVGProps } from 'react';

export default function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.4c.43 0 .83-.2 1.1-.54l.4-.52c.27-.34.68-.54 1.1-.54h2c.42 0 .83.2 1.1.54l.4.52c.27.34.67.54 1.1.54h1.4A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
