import { AiFillBell, AiOutlineBell } from 'react-icons/ai';

import type { IconBaseProps } from 'react-icons';

interface BellIconProps extends IconBaseProps {
  variant?: 'default' | 'new';
}

export default function BellIcon({
  variant = 'default',
  ...props
}: BellIconProps) {
  if (variant === 'new') {
    return <AiFillBell aria-hidden="true" {...props} />;
  }

  return <AiOutlineBell aria-hidden="true" {...props} />;
}
