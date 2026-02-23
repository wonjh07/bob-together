import Link from 'next/link';

import {
  button as buttonClass,
  buttonContent,
  buttonIcon,
  buttonLabel,
  submitButton,
} from './Buttons.css';

import type { CSSProperties, ReactNode } from 'react';

import { vars } from '@/styles/theme.css';

function cx(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

interface LoginButtonProps {
  children: ReactNode;
  href?: string;
  bg?: string;
  color?: string;
  icon?: ReactNode;
  className?: string;
}

export const LoginButton = ({
  children,
  href = '',
  bg = vars.color.main,
  color = vars.color.mainSoft,
  icon,
  className,
}: LoginButtonProps) => {
  const customStyles: CSSProperties | undefined =
    bg || color
      ? {
          ...(bg ? { backgroundColor: bg } : null),
          ...(color ? { color } : null),
        }
      : undefined;

  return (
    <Link
      href={href}
      className={cx(buttonClass, className)}
      style={customStyles}>
      <span className={buttonContent}>
        {icon ? <span className={buttonIcon}>{icon}</span> : null}
        <span className={buttonLabel}>{children}</span>
      </span>
    </Link>
  );
};

interface SubmitButtonProps {
  children?: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  defaultText?: string;
  disabled?: boolean;
  type?: 'submit' | 'button' | 'reset';
  icon?: ReactNode;
  className?: string;
}

export const SubmitButton = ({
  children,
  isLoading = false,
  loadingText = '처리 중...',
  defaultText = '제출',
  disabled = false,
  type = 'submit',
  icon,
  className,
}: SubmitButtonProps) => {
  return (
    <button
      type={type}
      className={cx(submitButton, className)}
      disabled={isLoading || disabled}>
      <span className={buttonContent}>
        {icon ? <span className={buttonIcon}>{icon}</span> : null}
        <span className={buttonLabel}>
          {children || (isLoading ? loadingText : defaultText)}
        </span>
      </span>
    </button>
  );
};

export default LoginButton;
