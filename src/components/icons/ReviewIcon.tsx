import type { SVGProps } from 'react';

export default function ReviewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M8 16l1.6-4.4 6.5-6.6 3 3-6.6 6.5L8 16z" fill="currentColor" />
    </svg>
  );
}
