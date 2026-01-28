import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const button = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '12px 16px',
  borderRadius: `0.5rem`,
  border: 'none',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.mainSoft,
  cursor: 'pointer',
});
