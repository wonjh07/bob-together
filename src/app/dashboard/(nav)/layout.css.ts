import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const layoutContainer = style({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  minHeight: '100dvh',
  paddingTop: '60px', // topNav 높이만큼 패딩 추가
  paddingBottom: '80px', // bottomNav 높이만큼 패딩 추가
  backgroundColor: vars.color.background,
});
