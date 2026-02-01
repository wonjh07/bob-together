import { redirect } from 'next/navigation';

export default async function RootPage() {
  // middleware에서 이미 인증 체크를 하므로
  // 이 페이지에 도달했다면 로그인된 상태
  redirect('/dashboard');
}
