import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const dashboardContainer = style({
  width: '100%',
  minHeight: '100%',
  backgroundColor: vars.color.background,
});