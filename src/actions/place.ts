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

const DEFAULT_PLACE_REVIEW_LIMIT = 10;
const MAX_PLACE_REVIEW_LIMIT = 30;

const placeIdSchema = z.object({
  placeId: z.string().uuid('유효한 장소 ID가 아닙니다.'),
});

const listPlaceReviewsSchema = z.object({
  placeId: z.string().uuid('유효한 장소 ID가 아닙니다.'),
  cursor: z
    .object({
      updatedAt: z.string().datetime({
        offset: true,
        message: '유효한 커서 정보가 아닙니다.',
      }),
      reviewId: z.string().uuid('유효한 커서 정보가 아닙니다.'),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_PLACE_REVIEW_LIMIT).optional(),
});

interface PlaceDetailRpcRow {
  place_id: string;
  name: string;
  address: string;
  category: string | null;
  latitude: number;
  longitude: number;
  review_avg: number | string | null;
  review_count: number | string | null;
}

function toRoundedAverage(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Number(numeric.toFixed(1));
}

function toCount(value: number | string | null): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 0;
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
  updatedAt: string;
  reviewId: string;
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
  const placeDetailRpc = 'get_place_detail_with_stats' as never;
  const placeDetailParams = {
    p_place_id: parsed.data.placeId,
  } as never;

  const { data, error } = await supabase.rpc(placeDetailRpc, placeDetailParams);
  const placeRows = (data as PlaceDetailRpcRow[] | null) ?? [];
  const place = placeRows[0] ?? null;

  if (error || !place) {
    return actionError('server-error', '장소 정보를 찾을 수 없습니다.');
  }

  return actionSuccess({
    place: {
      placeId: place.place_id,
      name: place.name,
      address: place.address,
      category: place.category || null,
      latitude: place.latitude,
      longitude: place.longitude,
      reviewAverage: toRoundedAverage(place.review_avg),
      reviewCount: toCount(place.review_count),
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
  const listReviewsRpc = 'list_place_reviews_with_cursor' as never;
  const listReviewsRpcParams = {
    p_place_id: placeId,
    p_limit: limit,
    p_cursor_updated_at: cursor?.updatedAt ?? null,
    p_cursor_review_id: cursor?.reviewId ?? null,
  } as never;

  const { data, error } = await supabase.rpc(listReviewsRpc, listReviewsRpcParams);

  if (error) {
    return actionError('server-error', '장소 리뷰를 불러오지 못했습니다.');
  }

  type PlaceReviewRpcRow = {
    review_id: string;
    user_id: string;
    score: number | null;
    review: string | null;
    edited_at: string | null;
    updated_at: string;
    user_name: string | null;
    user_nickname: string | null;
    user_profile_image: string | null;
  };

  const rows = (data as PlaceReviewRpcRow[] | null) ?? [];
  if (rows.length === 0) {
    return actionSuccess({
      reviews: [],
      nextCursor: null,
    });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = visibleRows[visibleRows.length - 1];

  const reviews: PlaceReviewItem[] = visibleRows.map((row) => ({
    reviewId: row.review_id,
    userId: row.user_id,
    userName: row.user_name ?? null,
    userNickname: row.user_nickname ?? null,
    userProfileImage: row.user_profile_image ?? null,
    score:
      typeof row.score === 'number' && row.score > 0
        ? row.score
        : 0,
    content: row.review?.trim() || '',
    editedAt: row.edited_at || row.updated_at,
  }));

  return actionSuccess({
    reviews,
    nextCursor: hasMore && lastRow
      ? {
          updatedAt: lastRow.updated_at,
          reviewId: lastRow.review_id,
        }
      : null,
  });
}
