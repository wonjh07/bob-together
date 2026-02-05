import type { SVGProps } from 'react';

export default function CommentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}>
      <path
        d="M4 5h16a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 4v-4H4a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="11.5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="11.5" r="1.2" fill="currentColor" />
      <circle cx="15.5" cy="11.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
