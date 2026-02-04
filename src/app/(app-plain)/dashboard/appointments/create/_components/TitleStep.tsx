import { container } from '../page.css';
import {
  helperText,
  inputLabel,
  primaryButton,
  section,
  stepTitle,
  underlineInput,
} from './TitleStep.css';

interface TitleStepProps {
  title: string;
  errorMessage: string;
  onTitleChange: (value: string) => void;
  onNext: () => void;
}

export function TitleStep({
  title,
  errorMessage,
  onTitleChange,
  onNext,
}: TitleStepProps) {
  return (
    <div className={container}>
      <div className={stepTitle}>약속 제목을 입력해주세요</div>
      <div className={section}>
        <label className={inputLabel} htmlFor="appointment-title">
          약속 제목
        </label>
        <input
          id="appointment-title"
          className={underlineInput}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="약속 제목을 입력하세요"
        />
      </div>
      <div className={helperText}>{errorMessage}</div>
      <button className={primaryButton} onClick={onNext}>
        확인
      </button>
    </div>
  );
}
