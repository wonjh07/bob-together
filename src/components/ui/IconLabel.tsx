import * as styles from './IconLabel.css';

import type { ReactNode } from 'react';

function cx(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

interface IconLabelProps {
  icon: ReactNode;
  children: ReactNode;
  as?: 'div' | 'span' | 'p';
  className?: string;
  iconClassName?: string;
}

export default function IconLabel({
  icon,
  children,
  as = 'div',
  className,
  iconClassName,
}: IconLabelProps) {
  const Component = as;

  return (
    <Component className={cx(styles.row, className)}>
      <span className={cx(styles.icon, iconClassName)}>{icon}</span>
      {children}
    </Component>
  );
}
