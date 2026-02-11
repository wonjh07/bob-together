import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  width: '100%',
  marginTop: '32px',
});

export const content = style({
  display: 'flex',
  overflowY: 'auto',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '28px',
});

export const profileImageButton = style({
  position: 'relative',
  width: '160px',
  height: '160px',
  border: 'none',
  borderRadius: '999px',
  backgroundColor: 'transparent',
  padding: 0,
});

export const profileImage = style({
  width: '160px',
  height: '160px',
  borderRadius: '999px',
  objectFit: 'cover',
  border: `3px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.stroke,
});

export const cameraBadge = style({
  position: 'absolute',
  right: '-2px',
  bottom: '4px',
  width: '42px',
  height: '42px',
  borderRadius: '999px',
  border: `2px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.subText,
  cursor: 'pointer',
  transition: 'transform 0.18s ease',
  selectors: {
    '&:hover': {
      transform: 'scale(1.1)',
    },
    '&:active': {
      transform: 'scale(0.96)',
    },
  },
});

export const cameraIcon = style({
  width: '22px',
  height: '22px',
});

export const deleteBadge = style({
  position: 'absolute',
  right: '6px',
  top: '8px',
  width: '36px',
  height: '36px',
  borderRadius: '999px',
  border: `2px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.alert,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.background,
  cursor: 'pointer',
  padding: 0,
  transition: 'transform 0.18s ease',
  selectors: {
    '&:hover': {
      transform: 'scale(1.1)',
    },
    '&:active': {
      transform: 'scale(0.96)',
    },
  },
});

export const deleteIcon = style({
  width: '22px',
  height: '22px',
});

export const fileInput = style({
  display: 'none',
});

export const form = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const fieldLabel = style({
  marginTop: '12px',
  marginBottom: '4px',
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.subText,
});
