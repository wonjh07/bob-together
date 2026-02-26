import type { ActionResult, AuthErrorCode } from '@/types/result';

export interface UserData {
  id?: string;
  email?: string;
  name?: string;
  nickname?: string;
  profileImage?: string;
}

export type GetUserDataResult = ActionResult<UserData, AuthErrorCode>;

export type ProfileErrorCode =
  | AuthErrorCode
  | 'profile-not-found'
  | 'metadata-sync-failed'
  | 'invalid-file'
  | 'file-too-large'
  | 'upload-failed'
  | 'update-failed';

export const MAX_PROFILE_IMAGE_SIZE = 200 * 1024; // 200KB
export const PROFILE_IMAGE_BUCKET = 'profile-images';

export type UploadProfileImageResult = ActionResult<
  { profileImageUrl: string },
  ProfileErrorCode
>;

export type DeleteProfileImageResult = ActionResult<void, ProfileErrorCode>;
export type UpdateProfileResult = ActionResult<void, ProfileErrorCode>;

export function extractStoragePathFromPublicUrl(
  publicUrl: string,
  bucket: string,
): string | null {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const encodedPath = url.pathname.slice(markerIndex + marker.length);
    if (!encodedPath) {
      return null;
    }

    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}
