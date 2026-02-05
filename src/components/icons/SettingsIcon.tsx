import type { SVGProps } from 'react';

export default function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}>
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2.5v2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19v2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2.5 12h2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 12h2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M5.2 5.2l1.8 1.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17 17l1.8 1.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18.8 5.2L17 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 17l-1.8 1.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
