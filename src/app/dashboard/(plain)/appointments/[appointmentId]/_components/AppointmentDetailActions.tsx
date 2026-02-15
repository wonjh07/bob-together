'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  joinAppointmentAction,
  leaveAppointmentAction,
} from '@/actions/appointment';
import {
  invalidateAppointmentDetailQuery,
  invalidateAppointmentListQueries,
} from '@/libs/query/invalidateAppointmentQueries';
import { getEffectiveAppointmentStatus } from '@/utils/appointmentStatus';

import * as styles from '../page.css';

type AppointmentStatus = 'pending' | 'canceled';

interface AppointmentDetailActionsProps {
  appointmentId: string;
  appointmentTitle: string;
  initialStatus: AppointmentStatus;
  endsAt: string;
  isOwner: boolean;
  initialIsMember: boolean;
}

export default function AppointmentDetailActions({
  appointmentId,
  appointmentTitle,
  initialStatus,
  endsAt,
  isOwner,
  initialIsMember,
}: AppointmentDetailActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const effectiveStatus = getEffectiveAppointmentStatus(initialStatus, endsAt);
  const isEnded = effectiveStatus === 'ended';
  const isCanceled = effectiveStatus === 'canceled';

  useEffect(() => {
    setIsMember(initialIsMember);
  }, [initialIsMember]);

  const goInvitationPage = () => {
    const title = encodeURIComponent(appointmentTitle);
    router.push(
      `/dashboard/appointments/invitation?appointmentId=${appointmentId}&title=${title}`,
    );
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
      await Promise.all([
        invalidateAppointmentDetailQuery(queryClient, appointmentId),
        invalidateAppointmentListQueries(queryClient),
      ]);
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
      await Promise.all([
        invalidateAppointmentDetailQuery(queryClient, appointmentId),
        invalidateAppointmentListQueries(queryClient),
      ]);
      toast.success('약속에서 나갔습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOwner) {
    if (isEnded || isCanceled) {
      return null;
    }

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

  if (isEnded) {
    return null;
  }

  if (isCanceled) {
    return null;
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
    </>
  );
}
