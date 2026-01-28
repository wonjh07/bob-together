'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { dropdownContent, logoutButton } from './profileDropdown.css';

interface ProfileDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDropdown({
  isOpen,
  onOpenChange,
}: ProfileDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, onOpenChange]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={dropdownContent}
      onClick={(e) => e.stopPropagation()}>
      <button
        className={logoutButton}
        onClick={handleLogout}
        disabled={isLoading}>
        {isLoading ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  );
}
