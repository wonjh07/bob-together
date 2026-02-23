// src/styles/theme.css.ts
import { createTheme } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({
  color: {
    mainSoft: '#FDF8F0',
    background: '#F9FAFB',
    stroke: '#E5E7EB',
    notification: '#FFEAE2',
    subText: '#5E6367',
    text: '#675B52',
    main: '#E75D2C',
    button: '#0091FF',
    muted: '#DBDEE5',
    alert: '#C5371E',
    success: '#339B31',
    star: '#D0BC1A',
    kakao: '#F6E340',
    black: '#343739',
  },

  radius: {
    sm: '10px',
    md: '14px',
    lg: '18px',
    xlg: '22px',
  },

  font: {
    body: 'system-ui, -apple-system, Segoe UI, Roboto, Apple SD Gothic Neo, Noto Sans KR, sans-serif',
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  fontSize: {
    caption: '0.75rem',
    subText: '0.875rem',
    text: '1rem',
    title: '1.125rem',
    header: '1.25rem',
    instruction: '1.5rem',
    serviceTitle: '2rem',
  },
});
