import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const bottomNav = style({
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: '768px',
  height: '80px',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  borderTop: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
  zIndex: 100,
});

export const navItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1, // 각 항목이 동일한 너비를 가지도록 설정
  height: '100%',
  gap: '4px',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
  color: vars.color.subText,
  cursor: 'pointer',

  ':hover': {
    color: vars.color.main,
  },
});

export const active = style({
  color: vars.color.main,
  fontWeight: vars.fontWeight.bold,
});
