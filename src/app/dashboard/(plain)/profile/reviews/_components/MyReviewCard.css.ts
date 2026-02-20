import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const card = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const headRow = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
});

export const placeName = style({
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  wordBreak: 'break-word',
});

export const starRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});

const starBase = style({
  fontSize: '1.5rem',
});

export const starFilled = style([
  starBase,
  {
    color: vars.color.star,
  },
]);

export const starEmpty = style([
  starBase,
  {
    color: '#727272',
  },
]);

export const content = style({
  fontSize: vars.fontSize.text,
  color: vars.color.black,
  fontWeight: vars.fontWeight.semibold,
  padding: '12px 0',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const date = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  fontWeight: vars.fontWeight.medium,
});

export const menuWrap = style({
  height: '100%',
  position: 'relative',
});

export const moreButton = style({
  backgroundColor: 'transparent',
  fontSize: vars.fontSize.header,
  color: vars.color.subText,
  cursor: 'pointer',
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
  width: '100px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  zIndex: 10,
});

const dropdownItemBase = style({
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

export const dropdownLink = style([
  dropdownItemBase,
  {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: vars.color.mainSoft,
    },
  },
]);

export const dropdownButton = style([
  dropdownItemBase,
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

export const dropdownDanger = style({
  color: vars.color.alert,
});

export const dropdownDisabled = style([
  dropdownItemBase,
  {
    color: vars.color.subText,
    cursor: 'not-allowed',
    backgroundColor: vars.color.mainSoft,
  },
]);
