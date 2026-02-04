import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const title = style({
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const bar = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '60px',
  padding: '12px 16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const pill = style({
  position: 'relative',
  display: 'flex',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.xlg,
  backgroundColor: vars.color.background,
  overflow: 'hidden',
});

export const indicator = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '50%',
  padding: '8px',
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.main,
  transition: 'transform 0.28s cubic-bezier(0.34, 1.14, 0.64, 1)',
});

export const indicatorRight = style({
  transform: 'translateX(100%)',
});

export const segment = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  gap: '2px',
  padding: '8px',
  background: 'none',
  border: 'none',
  outline: 'none',
  appearance: 'none',
  WebkitTapHighlightColor: 'transparent', // 모바일에서 클릭 시 생기는 하이라이트 제거
  color: vars.color.main,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
  position: 'relative',
  zIndex: 1,
});

export const active = style({
  color: vars.color.background,
  transition: 'background-color 0.2s ease, color 0.2s ease',
});
