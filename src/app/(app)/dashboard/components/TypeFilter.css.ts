import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const filterContainer = style({
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
});

export const chipButton = style({
  padding: '8px 16px',
  backgroundColor: 'white',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: '20px',
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',

  ':hover': {
    borderColor: vars.color.main,
    color: vars.color.main,
  },
});

export const chipButtonActive = style({
  backgroundColor: vars.color.main,
  borderColor: vars.color.main,
  color: 'white',

  ':hover': {
    backgroundColor: vars.color.main,
    borderColor: vars.color.main,
    color: 'white',
  },
});
