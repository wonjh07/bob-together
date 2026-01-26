import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const button = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '16px 16px',
  borderRadius: `0.5rem`,
  border: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  color: vars.color.mainSoft,
  cursor: 'pointer',
});
