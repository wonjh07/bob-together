'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { logoutAction } from '@/actions/auth';
import MenuIcon from '@/components/icons/MenuIcon';
import DropdownMenu from '@/components/ui/DropdownMenu';

import { dropdownContent, logoutButton } from './ProfileDrop.css';

interface ProfileDropdownProps {
  triggerClassName: string;
  triggerIconClassName: string;
}

export function ProfileDropdown({
  triggerClassName,
  triggerIconClassName,
}: ProfileDropdownProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      queryClient.clear();
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

  return (
    <DropdownMenu
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      menuClassName={dropdownContent}
      outsideEventType="click"
      renderTrigger={({ toggle }) => (
        <button
          type="button"
          className={triggerClassName}
          onClick={toggle}
          aria-label="메뉴 열기">
          <MenuIcon className={triggerIconClassName} />
        </button>
      )}>
      <button
        type="button"
        className={logoutButton}
        onClick={handleLogout}
        disabled={isLoading}>
        {isLoading ? '로그아웃 중...' : '로그아웃'}
      </button>
    </DropdownMenu>
  );
}
