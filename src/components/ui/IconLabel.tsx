import CalendarIcon from '@/components/icons/CalendarIcon';
import CommentIcon from '@/components/icons/CommentIcon';
import GroupIcon from '@/components/icons/GroupIcon';
import ReviewIcon from '@/components/icons/ReviewIcon';

import * as styles from './IconLabel.css';

import type { ReactNode } from 'react';

const ICON_SIZE = 18;

const ICON_MAP = {
  calendar: CalendarIcon,
  comment: CommentIcon,
  group: GroupIcon,
  review: ReviewIcon,
} as const;

type IconLabelIcon = keyof typeof ICON_MAP;

interface IconLabelProps {
  icon: IconLabelIcon;
  count: ReactNode;
  as?: 'div' | 'span' | 'p';
}

export default function IconLabel({
  icon,
  count,
  as = 'div',
}: IconLabelProps) {
  const Component = as;
  const IconComponent = ICON_MAP[icon];

  return (
    <Component className={styles.row}>
      <span className={styles.icon}>
        <IconComponent size={ICON_SIZE} />
      </span>
      <span className={styles.count}>{count}</span>
    </Component>
  );
}
