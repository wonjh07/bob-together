'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import {
  joinAppointmentAction,
  leaveAppointmentAction,
  updateAppointmentStatusAction,
} from '@/actions/appointment';
import { appointmentKeys } from '@/libs/query/appointmentKeys';

import * as styles from '../page.css';

type AppointmentStatus = 'pending' | 'confirmed' | 'canceled';

interface AppointmentDetailActionsProps {
  appointmentId: string;
  appointmentTitle: string;
  initialStatus: AppointmentStatus;
  isOwner: boolean;
  initialIsMember: boolean;
}

export default function AppointmentDetailActions({
  appointmentId,
  appointmentTitle,
  initialStatus,
  isOwner,
  initialIsMember,
}: AppointmentDetailActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AppointmentStatus>(initialStatus);
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goInvitationPage = () => {
    const title = encodeURIComponent(appointmentTitle);
    router.push(
      `/dashboard/appointments/invitation?appointmentId=${appointmentId}&title=${title}`,
    );
  };

  const updateStatus = async (nextStatus: AppointmentStatus) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const previousStatus = status;

    try {
      const result = await updateAppointmentStatusAction({
        appointmentId,
        status: nextStatus,
      });

      if (!result.ok) {
        toast.error(result.message || '약속 상태를 변경하지 못했습니다.');
        return;
      }

      if (!result.data) {
        toast.error('약속 상태를 변경하지 못했습니다.');
        return;
      }

      setStatus(result.data.status);
      await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });

      if (previousStatus === 'pending' && nextStatus === 'confirmed') {
        toast.success('약속이 확정되었습니다.');
        return;
      }

      if (previousStatus === 'confirmed' && nextStatus === 'pending') {
        toast.success('약속 확정이 취소되었습니다.');
        return;
      }

      if (nextStatus === 'canceled') {
        toast.success('약속이 취소되었습니다.');
        return;
      }

      toast.success('약속이 다시 활성화되었습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await joinAppointmentAction(appointmentId);
      if (!result.ok) {
        toast.error(result.message || '약속 참여에 실패했습니다.');
        return;
      }

      setIsMember(true);
      await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      router.refresh();
      toast.success('약속에 참여했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeave = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await leaveAppointmentAction(appointmentId);
      if (!result.ok) {
        toast.error(result.message || '약속 나가기에 실패했습니다.');
        return;
      }

      setIsMember(false);
      await queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      router.refresh();
      toast.success('약속에서 나갔습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOwner) {
    return isMember ? (
      <button
        type="button"
        className={styles.cancelButton}
        onClick={handleLeave}
        disabled={isSubmitting}>
        나가기
      </button>
    ) : (
      <button
        type="button"
        className={styles.confirmButton}
        onClick={handleJoin}
        disabled={isSubmitting}>
        참여하기
      </button>
    );
  }

  if (status === 'canceled') {
    return (
      <button
        type="button"
        className={styles.activateButton}
        onClick={() => updateStatus('pending')}
        disabled={isSubmitting}>
        약속 활성화하기
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.inviteButton}
        onClick={goInvitationPage}
        disabled={isSubmitting}>
        초대하기
      </button>

      <div className={styles.actionRow}>
        <button
          type="button"
          className={styles.confirmButton}
          onClick={() => updateStatus(status === 'confirmed' ? 'pending' : 'confirmed')}
          disabled={isSubmitting}>
          {status === 'confirmed' ? '확정 취소' : '확정하기'}
        </button>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => updateStatus('canceled')}
          disabled={isSubmitting}>
          취소하기
        </button>
      </div>
    </>
  );
}
