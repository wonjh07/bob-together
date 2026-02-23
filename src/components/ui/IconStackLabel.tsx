import * as styles from './IconStackLabel.css';

import type { ReactNode } from 'react';

function cx(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

interface IconStackLabelProps {
  icon: ReactNode;
  label: ReactNode;
  as?: 'div' | 'span' | 'p';
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
}

export default function IconStackLabel({
  icon,
  label,
  as = 'div',
  className,
  iconClassName,
  labelClassName,
}: IconStackLabelProps) {
  const Component = as;

  return (
    <Component className={cx(styles.root, className)}>
      <span className={cx(styles.iconWrap, iconClassName)}>{icon}</span>
      <span className={labelClassName}>{label}</span>
    </Component>
  );
}
