import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const searchForm = style({
  width: '100%',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});
