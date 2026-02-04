import Image from 'next/image';

import { LoginButton } from '@/components/ui/Buttons';

import LoginForm from './LoginForm';
import { loginPage, serviceTitle, title, buttonContainer } from './page.css';

import { vars } from '@/styles/theme.css';

export default function LoginPage() {
  return (
    <div className={loginPage}>
      <Image
        src="/loginImage.png"
        alt="Login Image"
        loading="eager"
        width={128}
        height={128}
        priority
      />
      <div className={serviceTitle}>밥투게더</div>
      <div className={title}>쉽고 편리한 밥약속 서비스</div>
      <LoginForm />
      <div className={buttonContainer}>
        <LoginButton href="/signup" bg={vars.color.text}>
          이메일로 가입하기
        </LoginButton>
        <LoginButton bg={vars.color.kakao} color={vars.color.text}>
          카카오로 시작
        </LoginButton>
      </div>
    </div>
  );
}
