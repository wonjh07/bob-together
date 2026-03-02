import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const page = style({
  minHeight: '100dvh',
  width: '100%',
  backgroundColor: vars.color.background,
  color: vars.color.text,
  padding: '24px 16px 40px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const headingWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
});

export const title = style({
  margin: 0,
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const description = style({
  margin: 0,
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  lineHeight: 1.4,
});

export const sectionList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const section = style({
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.mainSoft,
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const sectionHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const sectionTitle = style({
  margin: 0,
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
});

export const sectionDescription = style({
  margin: 0,
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
});

export const buttonGroup = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '8px',
});

export const button = style({
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.background,
  color: vars.color.text,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.medium,
  padding: '10px 12px',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  selectors: {
    '&:hover': {
      borderColor: vars.color.main,
    },
  },
});

export const sourceCode = style({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
});
