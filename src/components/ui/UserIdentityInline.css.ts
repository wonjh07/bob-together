import { style, styleVariants } from '@vanilla-extract/css';

import { inlineMeText } from '@/styles/primitives/badge.css';
import { vars } from '@/styles/theme.css';

export const row = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
});

export const avatar = style({
  borderRadius: '999px',
  border: `1px solid ${vars.color.stroke}`,
  objectFit: 'cover',
  backgroundColor: vars.color.stroke,
  flexShrink: 0,
});

export const avatarSize = styleVariants({
  xs: { width: '28px', height: '28px' },
  sm: { width: '30px', height: '30px' },
  md: { width: '36px', height: '36px' },
  lg: { width: '42px', height: '42px' },
  xl: { width: '56px', height: '56px' },
});

export const textWrap = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

export const nameRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  minWidth: 0,
});

export const name = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const meText = style([inlineMeText]);

export const subtitle = style({
  margin: 0,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.subText,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});
