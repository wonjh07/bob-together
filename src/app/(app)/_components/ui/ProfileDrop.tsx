'use client';

import { useState, useRef, useEffect } from 'react';

import { logoutAction } from '@/actions/auth';

import { dropdownContent, logoutButton } from './ProfileDrop.css';

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
      await logoutAction();
      // redirect가 성공하면 여기까지 오지 않음
    } catch (error) {
      // redirect는 NEXT_REDIRECT 에러를 던지므로 무시
      if (error && typeof error === 'object' && 'digest' in error) {
        throw error; // Next.js redirect 에러는 다시 던짐
      }
      console.error('Logout error:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
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
