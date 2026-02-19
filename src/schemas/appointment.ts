import { z } from 'zod';

export const appointmentTitleSchema = z
  .string()
  .trim()
  .min(1, '약속 제목을 입력해주세요.')
  .max(50, '약속 제목은 50자 이내로 입력해주세요.');

export const appointmentSearchSchema = z
  .string()
  .trim()
  .min(2, '검색어를 2자 이상 입력해주세요.')
  .max(50, '검색어는 50자 이내로 입력해주세요.');

export const appointmentDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '약속 날짜를 선택해주세요.');

export const appointmentTimeSchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, '시간을 선택해주세요.');

export const appointmentPlaceSchema = z.object({
  kakaoId: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  roadAddress: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

export const appointmentCreateSchema = z.object({
  title: appointmentTitleSchema,
  date: appointmentDateSchema,
  startTime: appointmentTimeSchema,
  endTime: appointmentTimeSchema,
  place: appointmentPlaceSchema,
  groupId: z.string().optional(),
});

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;

export const appointmentReviewScoreSchema = z
  .number()
  .int()
  .min(1, '별점을 선택해주세요.')
  .max(5, '별점은 1점부터 5점까지 선택할 수 있습니다.');

export const appointmentReviewContentSchema = z
  .string()
  .trim()
  .min(1, '리뷰 내용을 입력해주세요.')
  .max(300, '리뷰는 300자 이내로 입력해주세요.');

export const appointmentReviewSubmitSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 정보가 필요합니다.'),
  score: appointmentReviewScoreSchema,
  content: appointmentReviewContentSchema,
});
