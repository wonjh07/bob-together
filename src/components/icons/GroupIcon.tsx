import { AiOutlineTeam } from 'react-icons/ai';

import type { IconBaseProps } from 'react-icons';

function toNumericSize(value: IconBaseProps['size']) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

interface GroupIconProps extends IconBaseProps {
  width?: number | string;
  height?: number | string;
}

export default function GroupIcon({
  size,
  width,
  height,
  ...props
}: GroupIconProps) {
  const resolvedSize =
    toNumericSize(size) ??
    toNumericSize(width) ??
    toNumericSize(height) ??
    48;

  return (
    <AiOutlineTeam
      aria-hidden="true"
      size={resolvedSize}
      width={width}
      height={height}
      {...props}
    />
  );
}
