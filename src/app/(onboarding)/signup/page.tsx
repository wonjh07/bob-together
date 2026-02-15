import Link from 'next/link';

import { signupPage, title, buttonContainer } from './page.css';
import SignupForm from './SignupForm';

export default function SignupPage() {
  return (
    <div className={signupPage}>
      <div className={title}>회원가입</div>
      <SignupForm />
      <div className={buttonContainer}>
        <Link href="/login">이미 계정이 있으신가요?</Link>
      </div>
    </div>
  );
}
