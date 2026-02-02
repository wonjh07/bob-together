'use server';

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
