import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const chipContainer = style({
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
});

export const chipButton = style({
  padding: '8px 16px',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: '9999px',
  backgroundColor: vars.color.background,
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, color 0.2s ease',
  selectors: {
    '&:hover': {
      borderColor: vars.color.main,
      color: vars.color.main,
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const chipButtonActive = style({
  borderColor: vars.color.main,
  backgroundColor: vars.color.main,
  color: vars.color.background,
  selectors: {
    '&:hover': {
      borderColor: vars.color.main,
      backgroundColor: vars.color.main,
      color: vars.color.background,
    },
  },
});
