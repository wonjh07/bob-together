'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { submitPlaceReviewAction } from '@/actions/appointment';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { appointmentKeys } from '@/libs/query/appointmentKeys';
import { createAppointmentReviewTargetQueryOptions } from '@/libs/query/appointmentQueries';
import {
  invalidateAppointmentDetailQuery,
  invalidateAppointmentListQueries,
  invalidateAppointmentSearchQueries,
  invalidateMyReviewsQueries,
} from '@/libs/query/invalidateAppointmentQueries';

import * as styles from './page.css';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function parseDistrict(address: string): string {
  if (!address) return '';
  const parts = address.split(' ');
  return parts.find((part) => part.endsWith('동') || part.endsWith('구')) || '';
}

interface ReviewEditorClientProps {
  appointmentId: string;
}

export default function ReviewEditorClient({
  appointmentId,
}: ReviewEditorClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initializedAppointmentIdRef = useRef<string | null>(null);

  const reviewTargetQuery = useQuery({
    ...createAppointmentReviewTargetQueryOptions(appointmentId),
    enabled: Boolean(appointmentId),
  });

  const [score, setScore] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const target = reviewTargetQuery.data?.target;
    if (!target) return;
    if (initializedAppointmentIdRef.current === target.appointmentId) return;

    setScore(target.myReview?.score ?? 0);
    setContent(target.myReview?.content ?? '');
    initializedAppointmentIdRef.current = target.appointmentId;
  }, [reviewTargetQuery.data?.target]);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = '0px';
    element.style.height = `${element.scrollHeight}px`;
  }, [content]);

  if (!appointmentId) {
    return (
      <div className={styles.page}>
        <PlainTopNav title="리뷰" rightHidden />
        <div className={styles.statusBox}>리뷰 대상 약속이 없습니다.</div>
      </div>
    );
  }

  if (reviewTargetQuery.isLoading) {
    return (
      <div className={styles.page}>
        <PlainTopNav title="리뷰" rightHidden />
        <div className={styles.statusBox}>리뷰 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (reviewTargetQuery.isError || !reviewTargetQuery.data) {
    return (
      <div className={styles.page}>
        <PlainTopNav title="리뷰" rightHidden />
        <div className={styles.statusBox}>
          {reviewTargetQuery.error instanceof Error
            ? reviewTargetQuery.error.message
            : '리뷰 정보를 불러오지 못했습니다.'}
        </div>
      </div>
    );
  }

  const target = reviewTargetQuery.data.target;
  const isEditMode = target.hasReviewed;
  const district = parseDistrict(target.place.address);
  const reviewAverageText =
    target.place.reviewAverage !== null
      ? target.place.reviewAverage.toFixed(1)
      : '-';
  const trimmedContent = content.trim();
  const canSubmit =
    score >= 1 &&
    trimmedContent.length > 0 &&
    trimmedContent.length <= 300 &&
    !isSubmitting;

  const handleSubmitReview = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    const result = await submitPlaceReviewAction({
      appointmentId: target.appointmentId,
      score,
      content: trimmedContent,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.message || '리뷰 등록에 실패했습니다.');
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.historyRoot(),
      }),
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.myReviewsRoot(),
      }),
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.reviewTarget(target.appointmentId),
      }),
      invalidateAppointmentDetailQuery(queryClient, target.appointmentId),
      invalidateAppointmentListQueries(queryClient),
      invalidateAppointmentSearchQueries(queryClient),
      invalidateMyReviewsQueries(queryClient),
    ]);

    toast.success(
      result.data?.mode === 'updated'
        ? '리뷰가 수정되었습니다.'
        : '리뷰가 등록되었습니다.',
    );
    router.push('/dashboard/profile/reviews');
  };

  return (
    <div className={styles.page}>
      <PlainTopNav title="리뷰" rightHidden />

      <section className={styles.summarySection}>
        <p className={styles.date}>{formatDate(target.startAt)}</p>
        <h2 className={styles.placeName}>{target.place.name}</h2>
        <p className={styles.placeMeta}>
          <span className={styles.star}>★</span>
          <span>
            {reviewAverageText} ({target.place.reviewCount})
          </span>
          {district ? <span>· {district}</span> : null}
          {target.place.category ? (
            <span>· {target.place.category}</span>
          ) : null}
        </p>
      </section>

      <section className={styles.ratingSection}>
        <h3 className={styles.sectionTitle}>식당이 만족스러우셨나요?</h3>
        <div className={styles.starRow}>
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            const active = value <= score;

            return (
              <button
                key={value}
                type="button"
                className={active ? styles.starButtonActive : styles.starButton}
                onClick={() => setScore(value)}
                aria-label={`${value}점`}>
                ★
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.reviewSection}>
        <div className={styles.reviewHead}>
          <h3 className={styles.sectionTitle}>리뷰를 작성해주세요</h3>
          <span className={styles.count}>{content.length}/300</span>
        </div>
        <div className={styles.textareaWrap}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={content}
            onChange={(event) => setContent(event.target.value.slice(0, 300))}
            placeholder="리뷰를 입력해주세요"
            rows={1}
            maxLength={300}
          />
        </div>

        <button
          type="button"
          className={
            canSubmit ? styles.submitButton : styles.submitButtonDisabled
          }
          onClick={handleSubmitReview}
          disabled={!canSubmit}>
          {isEditMode ? '리뷰 수정하기' : '리뷰 남기기'}
        </button>
      </section>
    </div>
  );
}
