import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const formError = style({
  color: vars.color.alert,
  width: '100%',
});
