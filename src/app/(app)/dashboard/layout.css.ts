import { style } from '@vanilla-extract/css';

export const dashboardContainer = style({
  width: '100%',
  minHeight: 'calc(100dvh - 140px)', // topNav + bottomNav 높이만큼 제외
  display: 'flex',
  justifyContent: 'center',
  boxSizing: 'border-box',
});
