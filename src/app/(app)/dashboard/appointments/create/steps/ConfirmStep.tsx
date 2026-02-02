import {
  helperText,
  primaryButton,
  stepTitle,
  summaryCard,
  summaryRow,
  summaryValue,
} from './ConfirmStep.css';

import type { PlaceSummary } from '@/actions/place';

interface ConfirmStepProps {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  currentGroupName: string;
  selectedPlace: PlaceSummary;
  errorMessage: string;
  isSubmitting: boolean;
  onCreate: () => void;
}

export function ConfirmStep({
  title,
  date,
  startTime,
  endTime,
  currentGroupName,
  selectedPlace,
  errorMessage,
  isSubmitting,
  onCreate,
}: ConfirmStepProps) {
  return (
    <>
      <div className={stepTitle}>약속 정보를 확인해주세요</div>
      <div className={summaryCard}>
        <div className={summaryRow}>
          <span>약속 제목</span>
          <span className={summaryValue}>{title}</span>
        </div>
        <div className={summaryRow}>
          <span>약속 일자</span>
          <span className={summaryValue}>{date}</span>
        </div>
        <div className={summaryRow}>
          <span>약속 시간</span>
          <span className={summaryValue}>
            {startTime} ~ {endTime}
          </span>
        </div>
        <div className={summaryRow}>
          <span>그룹</span>
          <span className={summaryValue}>{currentGroupName}</span>
        </div>
        <div className={summaryRow}>
          <span>장소</span>
          <span className={summaryValue}>{selectedPlace.name}</span>
        </div>
        <div className={summaryRow}>
          <span>주소</span>
          <span className={summaryValue}>
            {selectedPlace.roadAddress || selectedPlace.address}
          </span>
        </div>
      </div>

      <div className={helperText}>{errorMessage}</div>
      <button
        className={primaryButton}
        onClick={onCreate}
        disabled={isSubmitting}>
        {isSubmitting ? '생성 중...' : '생성하기'}
      </button>
    </>
  );
}
