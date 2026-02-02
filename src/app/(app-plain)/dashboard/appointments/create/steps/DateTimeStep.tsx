import { container } from '../page.css';
import {
  helperText,
  inputLabel,
  primaryButton,
  section,
  stepTitle,
  timeInput,
  timeRow,
  underlineInput,
} from './DateTimeStep.css';

interface DateTimeStepProps {
  date: string;
  startTime: string;
  endTime: string;
  errorMessage: string;
  onDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onNext: () => void;
}

export function DateTimeStep({
  date,
  startTime,
  endTime,
  errorMessage,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onNext,
}: DateTimeStepProps) {
  return (
    <div className={container}>
      <div className={stepTitle}>약속 일자를 입력해주세요</div>
      <div className={section}>
        <label className={inputLabel} htmlFor="appointment-date">
          약속 날짜
        </label>
        <input
          id="appointment-date"
          type="date"
          className={underlineInput}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
        />
      </div>
      <div className={section}>
        <div className={inputLabel}>약속 시간</div>
        <div className={timeRow}>
          <input
            type="time"
            className={`${underlineInput} ${timeInput}`}
            value={startTime}
            onChange={(event) => onStartTimeChange(event.target.value)}
          />
          <input
            type="time"
            className={`${underlineInput} ${timeInput}`}
            value={endTime}
            onChange={(event) => onEndTimeChange(event.target.value)}
          />
        </div>
      </div>
      <div className={helperText}>{errorMessage}</div>
      <button className={primaryButton} onClick={onNext}>
        확인
      </button>
    </div>
  );
}
