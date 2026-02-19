import type { SVGProps } from 'react';

export default function GroupIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 8 64 64"
      width="48"
      height="48"
      fill="none"
      aria-hidden="true"
      {...props}>
      <circle cx="24" cy="24" r="10" fill="currentColor" />
      <circle cx="44" cy="28" r="8" fill="currentColor" opacity="0.85" />
      <path
        d="M10 52c0-8 6.5-14 14-14s14 6 14 14"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M34 52c0-6 4.5-10.5 10-10.5S54 46 54 52"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
