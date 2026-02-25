import { style } from '@vanilla-extract/css';

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
