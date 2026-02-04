'use server';

import { cookies } from 'next/headers';

const SELECTED_GROUP_COOKIE = 'selected_group_id';

export async function setSelectedGroupAction(groupId: string | null) {
  const cookieStore = cookies();

  if (!groupId) {
    cookieStore.delete(SELECTED_GROUP_COOKIE);
    return;
  }

  cookieStore.set(SELECTED_GROUP_COOKIE, groupId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}
