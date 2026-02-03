import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const mapFrame = style({
  width: '100%',
  height: '280px',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.stroke}`,
  background: 'white',
  overflow: 'hidden',
});

export const mapContainer = style({
  width: '100%',
  height: '100%',
});

export const mapPlaceholder = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
  background: 'white',
});
