import '@/styles/reset.css';
import '@/styles/globals.css';

import localFont from 'next/font/local';

import Providers from '@/app/providers';
import { KakaoMapPreload } from '@/components/kakao/KakaoMapPreload';
import AppToaster from '@/components/ui/AppToaster';
import { getServerQueryScope } from '@/libs/query/getServerQueryScope';

import type { Metadata } from 'next';

import { appFrame, appShell } from '@/app/layout.css';
import { themeClass } from '@/styles/theme.css';

const pretendard = localFont({
  src: [
    { path: '../fonts/Pretendard-Regular.woff2', weight: '400' },
    { path: '../fonts/Pretendard-Medium.woff2', weight: '500' },
    { path: '../fonts/Pretendard-SemiBold.woff2', weight: '600' },
    { path: '../fonts/Pretendard-Bold.woff2', weight: '700' },
  ],
  display: 'swap',
  preload: false,
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'BobTogether',
  description: '쉽고 편리한 밥약속 서비스',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryScope = await getServerQueryScope();

  return (
    <html lang="en" className={`${pretendard.variable} ${themeClass}`}>
      <body>
        <AppToaster />
        <KakaoMapPreload />
        <Providers initialQueryScope={queryScope}>
          <div className={appShell}>
            <div className={appFrame}>{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
