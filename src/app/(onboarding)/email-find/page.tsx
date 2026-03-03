import Moveback from '@/components/ui/BackButton';

import EmailFindForm from './EmailFindForm';
import * as styles from './page.css';

export default function EmailFindPage() {
  return (
    <div className={styles.emailFindPage}>
      <Moveback />
      <div className={styles.title}>이메일 찾기</div>
      <div className={styles.description}>
        가입 시 입력한 이름과 닉네임을 입력하면
        <br />
        마스킹된 이메일을 확인할 수 있어요.
      </div>
      <EmailFindForm />
    </div>
  );
}
