import Link from 'next/link';

import {
  successPage,
  container,
  title,
  message,
  buttonContainer,
} from './page.css';

export default function SignupSuccessPage() {
  return (
    <div className={successPage}>
      <div className={container}>
        <div className={title}>가입 완료!</div>
        <div className={message}>
          회원가입이 완료되었습니다.
          <br />
          이제 로그인하여 서비스를 이용할 수 있습니다.
        </div>
        <div className={buttonContainer}>
          <Link href="/login">로그인하기</Link>
        </div>
      </div>
    </div>
  );
}
