import type { SVGProps } from 'react';

export default function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 4a5 5 0 0 0-5 5v2.4c0 .7-.2 1.4-.6 2L5 16h14l-1.4-2.6a4 4 0 0 1-.6-2V9a5 5 0 0 0-5-5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
