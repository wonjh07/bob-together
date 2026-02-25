import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

import type { IconBaseProps } from 'react-icons';

interface StarIconProps extends IconBaseProps {
  filled?: boolean;
}

export default function StarIcon({
  filled = true,
  ...props
}: StarIconProps) {
  if (filled) {
    return <AiFillStar aria-hidden="true" {...props} />;
  }

  return <AiOutlineStar aria-hidden="true" {...props} />;
}
