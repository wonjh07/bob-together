import { z } from 'zod';

export const placeSearchSchema = z
  .string()
  .trim()
  .min(2, '검색어를 2자 이상 입력해주세요.')
  .max(50, '검색어는 50자 이내로 입력해주세요.');

export const placeSearchFormSchema = z.object({
  query: placeSearchSchema,
});

export type PlaceSearchFormInput = z.infer<typeof placeSearchFormSchema>;

export const placeSearchInputSchema = z
  .object({
    query: placeSearchSchema,
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    radius: z.number().int().min(1).max(20000).optional(),
  })
  .refine(
    (value) =>
      (value.latitude == null && value.longitude == null) ||
      (value.latitude != null && value.longitude != null),
    {
      message: '위도와 경도는 함께 전달되어야 합니다.',
      path: ['latitude'],
    },
  );

export type PlaceSearchInput = z.infer<typeof placeSearchInputSchema>;
