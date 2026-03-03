import Moveback from '@/components/ui/BackButton';

import * as styles from './page.css';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className={styles.resetPasswordPage}>
      <Moveback />
      <div className={styles.title}>비밀번호 재설정</div>
      <ResetPasswordForm />
    </div>
  );
}
