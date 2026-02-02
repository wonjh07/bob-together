import type { SVGProps } from 'react';

export default function PaperPlaneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      width="48"
      height="48"
      fill="none"
      aria-hidden="true"
      {...props}>
      <path
        d="M10 30L54 14l-18 40-6-16-20-8z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M10 30L54 14l-18 40-6-16-20-8z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M30 38l12-10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
