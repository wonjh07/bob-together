import { AiOutlineCheckCircle } from 'react-icons/ai';

import type { IconBaseProps } from 'react-icons';

export default function CheckIcon({ size = 48, ...props }: IconBaseProps) {
  return <AiOutlineCheckCircle aria-hidden="true" size={size} {...props} />;
}
