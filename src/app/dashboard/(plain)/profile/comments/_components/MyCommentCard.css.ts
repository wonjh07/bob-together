import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const card = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const headerRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
});

export const titleRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

export const calendarIcon = style({
  width: '24px',
  height: '24px',
  color: vars.color.main,
  flexShrink: 0,
});

export const title = style({
  margin: 0,
  fontSize: '2.2rem',
  lineHeight: 1.25,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  wordBreak: 'break-word',
});

export const content = style({
  margin: 0,
  fontSize: vars.fontSize.header,
  lineHeight: 1.35,
  color: vars.color.black,
  fontWeight: vars.fontWeight.semibold,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const date = style({
  margin: 0,
  fontSize: '2rem',
  color: vars.color.subText,
  fontWeight: vars.fontWeight.medium,
});

export const menuWrap = style({
  position: 'relative',
  flexShrink: 0,
});

export const moreButton = style({
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.subText,
  fontSize: '2.2rem',
  lineHeight: 1,
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

