import type { SVGProps } from 'react';

export default function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      width="48"
      height="48"
      fill="none"
      aria-hidden="true"
      {...props}>
      <circle cx="32" cy="32" r="24" fill="currentColor" opacity="0.15" />
      <path
        d="M20 33l8 8 16-18"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
