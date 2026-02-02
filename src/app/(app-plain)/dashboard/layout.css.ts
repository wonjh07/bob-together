import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const layoutContainer = style({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100dvh',
  paddingTop: '60px', // topNav 높이만큼 패딩 추가
  paddingBottom: '80px', // bottomNav 높이만큼 패딩 추가
  paddingLeft: '16px',
  paddingRight: '16px',
  backgroundColor: vars.color.background,
});
