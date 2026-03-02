import { style, styleVariants } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const row = style({
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: 0,
});

export const rowSize = styleVariants({
  sm: { gap: '6px' },
  md: { gap: '8px' },
  lg: { gap: '12px' },
});

export const avatar = style({
  borderRadius: '999px',
  border: `1px solid ${vars.color.stroke}`,
  objectFit: 'cover',
  backgroundColor: vars.color.stroke,
  flexShrink: 0,
});

export const avatarSize = styleVariants({
  sm: { width: '30px', height: '30px' },
  md: { width: '42px', height: '42px' },
  lg: { width: '56px', height: '56px' },
});

export const textWrap = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

export const textWrapSize = styleVariants({
  sm: { gap: '0px' },
  md: { gap: '2px' },
  lg: { gap: '2px' },
});

export const nameRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  minWidth: 0,
});

export const name = style({
  color: vars.color.text,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const nameSize = styleVariants({
  sm: {
    fontSize: vars.fontSize.subText,
    fontWeight: vars.fontWeight.semibold,
  },
  md: {
    fontSize: vars.fontSize.text,
    fontWeight: vars.fontWeight.semibold,
  },
  lg: {
    fontSize: vars.fontSize.text,
    fontWeight: vars.fontWeight.semibold,
  },
});

export const meText = style({
  color: vars.color.main,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.bold,
  flexShrink: 0,
});

export const subtitle = style({
  margin: 0,
  color: vars.color.subText,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const subtitleSize = styleVariants({
  sm: {
    fontSize: vars.fontSize.caption,
    fontWeight: vars.fontWeight.medium,
  },
  md: {
    fontSize: vars.fontSize.subText,
    fontWeight: vars.fontWeight.medium,
  },
  lg: {
    fontSize: vars.fontSize.subText,
    fontWeight: vars.fontWeight.medium,
  },
});
