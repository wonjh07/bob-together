import Link from 'next/link';
import React from 'react';

import { button as buttonClass } from './button.css';

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

export default LoginButton;
