import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const wrap = style({
  position: 'relative',
  flexShrink: 0,
});

export const trigger = style({
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.subText,
  fontSize: vars.fontSize.header,
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0,
  selectors: {
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const dropdown = style({
  position: 'absolute',
  top: '30px',
  right: 0,
  width: '124px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  zIndex: 10,
});

const itemBase = style({
  width: '100%',
  padding: '10px 12px',
  border: 'none',
  borderBottom: `1px solid ${vars.color.stroke}`,
  backgroundColor: 'transparent',
  textAlign: 'left',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
  textDecoration: 'none',
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
});

export const linkItem = style([
  itemBase,
  {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: vars.color.mainSoft,
    },
  },
]);

export const buttonItem = style([
  itemBase,
  {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: vars.color.mainSoft,
    },
    selectors: {
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  },
]);

export const dangerItem = style({
  color: vars.color.alert,
});

export const disabledItem = style([
  itemBase,
  {
    color: vars.color.subText,
    cursor: 'not-allowed',
    backgroundColor: vars.color.mainSoft,
  },
]);
