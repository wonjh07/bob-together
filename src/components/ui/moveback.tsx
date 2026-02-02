'use client';

import { useRouter } from 'next/navigation';

import { movebackButton, movebackContainer } from './moveback.css';

export default function Moveback() {
  const router = useRouter();

  return (
    <div className={movebackContainer}>
      <button
        className={movebackButton}
        onClick={() => router.back()}
        aria-label="뒤로가기">
        &lt;
      </button>
    </div>
  );
}
