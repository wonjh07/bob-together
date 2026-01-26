import Image from 'next/image';
import { LoginButton } from '@/components/ui/button';
import { buttonContainer, container, serviceTitle, title } from './page.css';
import { vars } from '@/styles/theme.css';

export default function Home() {
  return (
    <div className={container}>
      <Image
        src="/loginImage.png"
        alt="Login Image"
        loading="eager"
        width={128}
        height={128}
      />
      <div className={serviceTitle}>밥투게더</div>
      <div className={title}>쉽고 편리한 밥약속 서비스</div>
      <div className={buttonContainer}>
        <LoginButton bg={vars.color.main}>이메일로 로그인하기</LoginButton>
        <LoginButton bg={vars.color.text}>이메일로 가입하기</LoginButton>
        <LoginButton bg={vars.color.kakao} color={vars.color.text}>
          카카오로 시작
        </LoginButton>
      </div>
    </div>
  );
}
