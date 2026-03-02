import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const title = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const placeName = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  wordBreak: 'break-word',
});

export const meta = style({
  margin: 0,
});

export const placeLink = style({
  color: 'inherit',
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      textDecoration: 'underline',
    },
    '&:focus-visible': {
      textDecoration: 'underline',
    },
  },
});
