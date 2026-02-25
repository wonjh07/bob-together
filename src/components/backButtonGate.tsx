'use client';

import { useSelectedLayoutSegments } from 'next/navigation';

import Moveback from '@/components/ui/BackButton';

const SHOW_ON = new Set<string>([
  'signup',
]);

export default function BackButtonGate() {
  const segments = useSelectedLayoutSegments();
  const routeKey = segments
    .filter((segment) => !segment.startsWith('('))
    .join('/');

  if (!SHOW_ON.has(routeKey)) return null;
  return <Moveback />;
}
