import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  width: '100%',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const wrapper = style({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  borderRadius: vars.radius.xlg,
  border: `1px solid ${vars.color.main}`,
});

export const input = style({
  flex: 1, // 가로로 가능한 최대한 확장
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: vars.color.text,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.medium,
});

export const icon = style({
  display: 'flex',
  alignItems: 'center',
  color: vars.color.main,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      transform: 'scale(1.2)',
      transition: 'transform 0.1s ease-in-out',
    },
  },
});
