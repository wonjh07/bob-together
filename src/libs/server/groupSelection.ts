import { cookies } from 'next/headers';

const SELECTED_GROUP_COOKIE = 'selected_group_id';

export function getSelectedGroupIdFromCookies() {
  const cookieStore = cookies();
  return cookieStore.get(SELECTED_GROUP_COOKIE)?.value ?? null;
}
