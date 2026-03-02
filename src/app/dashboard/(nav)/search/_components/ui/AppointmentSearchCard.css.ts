import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const card = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '16px',
  padding: '12px 16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
  textDecoration: 'none',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.mainSoft,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.main}`,
      outlineOffset: '-2px',
    },
  },
});

export const info = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  width: '100%',
  minWidth: 0,
  color: vars.color.text,
});

export const title = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});
