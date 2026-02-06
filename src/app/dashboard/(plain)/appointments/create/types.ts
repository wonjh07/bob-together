import { z } from 'zod';

import {
  appointmentCreateSchema,
  appointmentPlaceSchema,
} from '@/schemas/appointment';

export const appointmentCreateFormSchema = appointmentCreateSchema
  .extend({
    groupId: z.string().nullable(),
    place: appointmentPlaceSchema.nullable(),
  })
  .refine(
    (data) => !data.startTime || !data.endTime || data.endTime > data.startTime,
    {
      message: '종료 시간이 시작 시간보다 늦어야 합니다.',
      path: ['endTime'],
    },
  )
  .refine((data) => data.groupId !== null, {
    message: '그룹을 선택해주세요.',
    path: ['groupId'],
  })
  .refine((data) => data.place !== null, {
    message: '장소를 선택해주세요.',
    path: ['place'],
  });

export type CreateAppointmentForm = z.infer<typeof appointmentCreateFormSchema>;
