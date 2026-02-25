'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { placeSearchInputSchema } from '@/schemas/place';

import type { PlaceSearchInput } from '@/schemas/place';
import type { ActionResult, PlaceErrorCode } from '@/types/result';

export interface PlaceSummary {
  kakaoId: string;
  name: string;
  address: string;
  roadAddress: string | null;
  category: string | null;
  phone: string | null;
  url: string | null;
  latitude: number;
  longitude: number;
}

export type SearchPlacesResult = ActionResult<
  { places: PlaceSummary[] },
  PlaceErrorCode
>;

const USER_REVIEW_TABLE = 'user_review';
const DEFAULT_PLACE_REVIEW_LIMIT = 10;
const MAX_PLACE_REVIEW_LIMIT = 30;

const placeIdSchema = z.object({
  placeId: z.string().uuid('유효한 장소 ID가 아닙니다.'),
});

const listPlaceReviewsSchema = z.object({
  placeId: z.string().uuid('유효한 장소 ID가 아닙니다.'),
  cursor: z
    .object({
      offset: z.number().int().min(0, '유효한 커서 정보가 아닙니다.'),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_PLACE_REVIEW_LIMIT).optional(),
});

interface PlaceReviewStatRow {
  score: number | null;
}

interface PlaceReviewRow {
  review_id: string;
  user_id: string;
  score: number | null;
  review: string | null;
  edited_at: string | null;
  updated_at: string;
  user: {
    user_id: string;
    name: string | null;
    nickname: string | null;
    profile_image: string | null;
  } | null;
}

export interface PlaceDetailItem {
  placeId: string;
  name: string;
  address: string;
  category: string | null;
  latitude: number;
  longitude: number;
  reviewAverage: number | null;
  reviewCount: number;
}

export interface PlaceReviewCursor {
  offset: number;
}

export interface PlaceReviewItem {
  reviewId: string;
  userId: string;
  userName: string | null;
  userNickname: string | null;
  userProfileImage: string | null;
  score: number;
  content: string;
  editedAt: string;
}

export type GetPlaceDetailResult = ActionResult<
  { place: PlaceDetailItem },
  PlaceErrorCode
>;

export type ListPlaceReviewsResult = ActionResult<
  {
    reviews: PlaceReviewItem[];
    nextCursor: PlaceReviewCursor | null;
  },
  PlaceErrorCode
>;

type KakaoPlaceDocument = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  category_name: string;
  phone: string;
  place_url: string;
  x: string;
  y: string;
};

export async function searchPlacesAction(
  input: PlaceSearchInput,
): Promise<SearchPlacesResult> {
  const parsed = placeSearchInputSchema.safeParse(input);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '검색어를 입력해주세요.',
    };
  }

  const restApiKey = process.env.KAKAO_REST_API_KEY;

  if (!restApiKey) {
    return {
      ok: false,
      error: 'missing-config',
      message: '카카오 REST API 키가 필요합니다.',
    };
  }

  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
  const { query, latitude, longitude, radius } = parsed.data;
  url.searchParams.set('query', query);

  if (latitude != null && longitude != null) {
    url.searchParams.set('x', String(longitude));
    url.searchParams.set('y', String(latitude));
    url.searchParams.set('sort', 'distance');
    url.searchParams.set('radius', String(radius ?? 5000));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `KakaoAK ${restApiKey}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return {
      ok: false,
      error: 'provider-error',
      message: '장소 검색에 실패했습니다.',
    };
  }

  const json = (await response.json()) as {
    documents?: KakaoPlaceDocument[];
  };

  const normalizeText = (value?: string) =>
    value?.replace(/\s+/g, ' ').trim() ?? '';

  const places =
    json.documents?.map((doc) => ({
      kakaoId: doc.id,
      name: normalizeText(doc.place_name),
      address: normalizeText(doc.address_name),
      roadAddress: normalizeText(doc.road_address_name) || null,
      category: normalizeText(doc.category_name) || null,
      phone: normalizeText(doc.phone) || null,
      url: normalizeText(doc.place_url) || null,
      latitude: Number(doc.y),
      longitude: Number(doc.x),
    })) ?? [];

  return {
    ok: true,
    data: {
      places,
    },
  };
}

export async function getPlaceDetailAction(
  placeId: string,
): Promise<GetPlaceDetailResult> {
  const parsed = parseOrFail(placeIdSchema, { placeId });
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase } = auth;

  const { data: place, error: placeError } = await supabase
    .from('places')
    .select('place_id, name, address, category, latitude, longitude')
    .eq('place_id', parsed.data.placeId)
    .maybeSingle();

  if (placeError || !place) {
    return actionError('server-error', '장소 정보를 찾을 수 없습니다.');
  }

  const { data: reviewRows, error: reviewError } = await supabase
    .from(USER_REVIEW_TABLE)
    .select('score')
    .eq('place_id', parsed.data.placeId)
    .not('appointment_id', 'is', null)
    .not('score', 'is', null);

  if (reviewError) {
    return actionError('server-error', '장소 리뷰 요약을 불러오지 못했습니다.');
  }

  const reviewStats = (reviewRows as unknown as PlaceReviewStatRow[] | null) ?? [];
  const reviewCount = reviewStats.length;
  const reviewSum = reviewStats.reduce(
    (sum, row) => sum + (typeof row.score === 'number' ? row.score : 0),
    0,
  );
  const reviewAverage =
    reviewCount > 0 ? Number((reviewSum / reviewCount).toFixed(1)) : null;

  return actionSuccess({
    place: {
      placeId: place.place_id,
      name: place.name,
      address: place.address,
      category: place.category || null,
      latitude: place.latitude,
      longitude: place.longitude,
      reviewAverage,
      reviewCount,
    },
  });
}

export async function listPlaceReviewsAction(params: {
  placeId: string;
  cursor?: PlaceReviewCursor | null;
  limit?: number;
}): Promise<ListPlaceReviewsResult> {
  const parsed = parseOrFail(listPlaceReviewsSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase } = auth;
  const { placeId, cursor, limit = DEFAULT_PLACE_REVIEW_LIMIT } = parsed.data;
  const offset = cursor?.offset ?? 0;

  const { data, error } = await supabase
    .from(USER_REVIEW_TABLE)
    .select(
      `
      review_id,
      user_id,
      score,
      review,
      edited_at,
      updated_at,
      user:users(
        user_id,
        name,
        nickname,
        profile_image
      )
      `,
    )
    .eq('place_id', placeId)
    .not('appointment_id', 'is', null)
    .or('score.not.is.null,review.not.is.null')
    .order('updated_at', { ascending: false })
    .order('review_id', { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    return actionError('server-error', '장소 리뷰를 불러오지 못했습니다.');
  }

  const rows = (data as unknown as PlaceReviewRow[] | null) ?? [];
  if (rows.length === 0) {
    return actionSuccess({
      reviews: [],
      nextCursor: null,
    });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;

  const reviews: PlaceReviewItem[] = visibleRows.map((row) => ({
    reviewId: row.review_id,
    userId: row.user_id,
    userName: row.user?.name ?? null,
    userNickname: row.user?.nickname ?? null,
    userProfileImage: row.user?.profile_image ?? null,
    score:
      typeof row.score === 'number' && row.score > 0
        ? row.score
        : 0,
    content: row.review?.trim() || '',
    editedAt: row.edited_at || row.updated_at,
  }));

  return actionSuccess({
    reviews,
    nextCursor: hasMore
      ? {
          offset: offset + limit,
        }
      : null,
  });
}
