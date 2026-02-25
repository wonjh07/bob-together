import { AiOutlineSend } from 'react-icons/ai';

import type { IconBaseProps } from 'react-icons';

export default function PaperPlaneIcon({ size = 48, ...props }: IconBaseProps) {
  return <AiOutlineSend aria-hidden="true" size={size} {...props} />;
}
