import { type NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/libs/supabase/proxy';

// 경로 보호 설정
const PUBLIC_ROUTES = ['/', '/login', '/signup'];
const AUTH_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Supabase 세션 업데이트 및 사용자 정보 가져오기
  const { response, user } = await updateSession(request);

  // 2. Public 경로 체크
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith('/auth'),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // 3. 로그인되지 않은 사용자가 보호된 경로 접근 시
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  // 4. 로그인된 사용자가 인증 페이지 접근 시 대시보드로 리다이렉트
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
