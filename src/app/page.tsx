import { redirect } from 'next/navigation';

export default function RootPage() {
  const isLoggedIn = false;
  redirect(isLoggedIn ? '/dashboard' : '/login');
}
