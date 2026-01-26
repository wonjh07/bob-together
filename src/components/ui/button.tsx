import React from 'react';

import { button as buttonClass } from './button.css';

import { vars } from '@/styles/theme.css';

interface LoginButtonProps {
  children: React.ReactNode;
  bg?: string;
  color?: string;
  icon?: React.ReactNode;
}

export const LoginButton = ({
  children,
  bg = vars.color.main,
  color = vars.color.mainSoft,
}: LoginButtonProps) => {
  return (
    <button
      type="button"
      className={buttonClass}
      style={{ background: bg, color }}>
      {children}
    </button>
  );
};

export default LoginButton;
