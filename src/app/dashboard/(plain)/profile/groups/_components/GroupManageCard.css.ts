import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const headRow = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
});

export const groupName = style({
  margin: 0,
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const menuWrap = style({
  position: 'relative',
});

export const moreButton = style({
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.subText,
  fontSize: '2rem',
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0,
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const dropdown = style({
  position: 'absolute',
  top: '32px',
  right: 0,
  width: '110px',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.background,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  zIndex: 10,
  overflow: 'hidden',
});

export const dropdownItem = style({
  width: '100%',
  border: 'none',
  backgroundColor: 'transparent',
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.alert,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    '&:hover': {
      backgroundColor: vars.color.mainSoft,
    },
  },
});

export const ownerRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const avatar = style({
  width: '42px',
  height: '42px',
  borderRadius: '999px',
  border: `2px solid ${vars.color.stroke}`,
  objectFit: 'cover',
  backgroundColor: vars.color.stroke,
});

export const ownerNameRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

export const ownerName = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const meText = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.main,
});

export const footerRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const dateText = style({
  fontSize: vars.fontSize.text,
  color: vars.color.text,
});

export const memberMeta = style({
  display: 'inline-flex',
  alignItems: 'flex-end',
  gap: '4px',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.text,
});
