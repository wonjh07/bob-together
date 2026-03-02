import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const stepTitle = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const appointmentTitle = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  margin: '4px 0',
});

export const placeSection = style({
  marginTop: '14px',
  width: '100%',
});

export const mapWrapper = style({
  borderRadius: vars.radius.xlg,
  overflow: 'hidden',
  border: `1px solid ${vars.color.stroke}`,
});

export const section = style({
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.xlg,
  padding: '12px',
});

export const memberRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
});

export const memberTitle = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
});

export const helperText = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
  minHeight: '16px',
});
