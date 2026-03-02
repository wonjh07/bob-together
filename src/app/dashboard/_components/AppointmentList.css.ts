import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
});

export const filtersContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const filterRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
});
