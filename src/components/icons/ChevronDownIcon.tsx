import type { SVGProps } from 'react';

export default function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
