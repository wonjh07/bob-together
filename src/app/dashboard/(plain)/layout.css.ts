import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const layoutContainer = style({
  position: 'relative',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  width: '100%',
  height: '100dvh',
  overflowY: 'auto',
  overflowX: 'hidden',
  paddingTop: '60px', // 상단 패널높이만큼 패딩 추가
  backgroundColor: vars.color.background,
});
