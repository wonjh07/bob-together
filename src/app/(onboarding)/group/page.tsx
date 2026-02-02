import Link from 'next/link';

import GroupIcon from '@/components/icons/GroupIcon';

import {
  entryTitle,
  entryDescription,
  serviceTitle,
} from './page.css';
import {
  page,
  panel,
  iconWrap,
  buttonStack,
  buttonBase,
  primaryButton,
  secondaryButton,
  linkButton,
} from './shared.css';

export default function GroupEntryPage() {
  return (
    <div className={page}>
      <div className={panel}>
        <div className={iconWrap}>
          <GroupIcon />
        </div>
        <div className={entryTitle}>아직 가입한 그룹이 없으시네요</div>
        <div className={serviceTitle}>밥투게더</div>
        <div className={entryDescription}>
          서비스를 이용하려면
          <br />
          하나 이상의 그룹에 가입해야해요
        </div>
        <div className={buttonStack}>
          <Link
            href="/group/join"
            className={`${buttonBase} ${primaryButton} ${linkButton}`}>
            그룹 가입하기
          </Link>
          <Link
            href="/group/create"
            className={`${buttonBase} ${secondaryButton} ${linkButton}`}>
            그룹 생성하기
          </Link>
        </div>
      </div>
    </div>
  );
}
