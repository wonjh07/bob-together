import { style, styleVariants } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

const containerBase = style({
  display: 'flex',
  gap: '8px',
});

export const container = styleVariants({
  wrap: [
    containerBase,
    {
      flexWrap: 'wrap',
    },
  ],
  scroll: [
    containerBase,
    {
      flexWrap: 'nowrap',
      overflowX: 'auto',
      minWidth: 0,
      flex: '1 1 auto',
    },
  ],
});

const buttonBase = style({
  padding: '8px 16px',
  borderRadius: '9999px',
  fontSize: vars.fontSize.subText,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  border: `1px solid ${vars.color.stroke}`,
  transition: 'border-color 0.2s ease, color 0.2s ease',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const button = styleVariants({
  inactive: [
    buttonBase,
    {
      backgroundColor: vars.color.background,
      color: vars.color.text,
      selectors: {
        '&:hover': {
          borderColor: vars.color.main,
          color: vars.color.main,
        },
      },
    },
  ],
  active: [
    buttonBase,
    {
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
    },
  ],
});
