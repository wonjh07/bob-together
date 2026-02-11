'use server';

import { cookies } from 'next/headers';

const SELECTED_GROUP_COOKIE = 'selected_group_id';

const SELECTED_GROUP_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
};

export async function getSelectedGroupCookie() {
  const cookieStore = cookies();
  return cookieStore.get(SELECTED_GROUP_COOKIE)?.value ?? null;
}

export async function setSelectedGroupCookie(groupId: string | null) {
  const cookieStore = cookies();

  if (!groupId) {
    cookieStore.delete(SELECTED_GROUP_COOKIE);
    return;
  }

  cookieStore.set(SELECTED_GROUP_COOKIE, groupId, SELECTED_GROUP_COOKIE_OPTIONS);
}
