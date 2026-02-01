import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Supabase 세션 업데이트 및 사용자 정보 반환
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Fluid Compute 환경에서는 이 클라이언트를 전역 변수로 두지 마세요.
  // 요청마다 새로 생성해야 합니다.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // createServerClient와 supabase.auth.getClaims() 사이에는 코드를 추가하지 마세요.
  // 작은 실수로도 사용자가 랜덤하게 로그아웃되는 문제를 디버깅하기 매우 어려워질 수 있습니다.

  // 중요: getClaims()를 제거한 채 Supabase 클라이언트로 SSR을 사용하면
  // 사용자가 랜덤하게 로그아웃될 수 있습니다.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  // 중요: supabaseResponse 객체는 반드시 그대로 반환해야 합니다. NextResponse.next()로
  // 새로운 응답 객체를 만들 경우, 아래를 꼭 지키세요:
  // 1. request를 전달합니다. 예:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. 쿠키를 복사합니다. 예:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. 필요에 맞게 myNewResponse를 수정하되, 쿠키는 바꾸지 마세요!
  // 4. 마지막으로:
  //    return myNewResponse
  // 이를 지키지 않으면 브라우저와 서버의 쿠키 상태가 어긋나 세션이 조기에 종료될 수 있습니다.
  // user 정보를 함께 반환하여 middleware에서 사용 가능하도록 함

  return { response: supabaseResponse, user };
}
