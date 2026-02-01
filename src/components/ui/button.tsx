import Link from 'next/link';
import React from 'react';

import { button as buttonClass, submitButton } from './button.css';

import { vars } from '@/styles/theme.css';

interface LoginButtonProps {
  children: React.ReactNode;
  href?: string;
  bg?: string;
  color?: string;
  icon?: React.ReactNode;
}

export const LoginButton = ({
  children,
  href = '',
  bg = vars.color.main,
  color = vars.color.mainSoft,
}: LoginButtonProps) => {
  return (
    <Link
      href={href}
      type="button"
      className={buttonClass}
      style={{ background: bg, color }}>
      {children}
    </Link>
  );
};

interface SubmitButtonProps {
  children?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  defaultText?: string;
  disabled?: boolean;
  type?: 'submit' | 'button' | 'reset';
}

export const SubmitButton = ({
  children,
  isLoading = false,
  loadingText = '처리 중...',
  defaultText = '제출',
  disabled = false,
  type = 'submit',
}: SubmitButtonProps) => {
  return (
    <button
      type={type}
      className={submitButton}
      disabled={isLoading || disabled}>
      {children || (isLoading ? loadingText : defaultText)}
    </button>
  );
};

export default LoginButton;
