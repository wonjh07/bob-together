import PlainTopNav from '@/components/ui/PlainTopNav';

interface AppointmentEditTopNavProps {
  onComplete?: () => void;
  isSubmitting?: boolean;
}

export default function AppointmentEditTopNav({
  onComplete,
  isSubmitting = false,
}: AppointmentEditTopNavProps) {
  return (
    <PlainTopNav
      title="약속 수정"
      rightLabel={isSubmitting ? '저장중' : '완료'}
      rightAriaLabel="수정 완료"
      onRightAction={onComplete}
      rightDisabled={!onComplete || isSubmitting}
    />
  );
}
