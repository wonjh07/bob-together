'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import {
  deleteProfileImageAction,
  updateProfileAction,
  uploadProfileImageAction,
} from '@/actions/user';
import CameraIcon from '@/components/icons/CameraIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import FormError from '@/components/ui/FormError';
import { Input } from '@/components/ui/FormInput';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { nameSchema, nicknameSchema, passwordSchema } from '@/schemas/auth';
import { convertToJpegUnderLimit } from '@/utils/convertToJpegUnderLimit';

import * as styles from './ProfileEditClient.css';

const profileEditSchema = z
  .object({
    name: nameSchema,
    nickname: nicknameSchema,
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasPassword = !!data.password?.trim();
    if (!hasPassword) return;

    const passwordResult = passwordSchema.safeParse(data.password);
    if (!passwordResult.success) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message:
          passwordResult.error.issues[0]?.message ||
          '비밀번호 형식이 올바르지 않습니다.',
      });
    }

    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: 'custom',
        path: ['passwordConfirm'],
        message: '비밀번호가 일치하지 않습니다.',
      });
    }
  });

type ProfileEditInput = z.infer<typeof profileEditSchema>;
const MAX_PROFILE_IMAGE_SIZE = 200 * 1024; // 200KB

interface ProfileEditClientProps {
  initialName: string;
  initialNickname: string;
  initialProfileImage: string | null;
}

export default function ProfileEditClient({
  initialName,
  initialNickname,
  initialProfileImage,
}: ProfileEditClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(initialProfileImage);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isImageMarkedForDelete, setIsImageMarkedForDelete] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditInput>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: initialName,
      nickname: initialNickname,
      password: '',
      passwordConfirm: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUploadProfileImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearErrors('root');

    try {
      const convertedFile = await convertToJpegUnderLimit(file, {
        maxBytes: MAX_PROFILE_IMAGE_SIZE,
      });

      if (convertedFile.size > MAX_PROFILE_IMAGE_SIZE) {
        setError('root', {
          message: '이미지를 200KB 이하 JPEG로 변환할 수 없습니다.',
        });
        event.target.value = '';
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const localPreview = URL.createObjectURL(convertedFile);
      setPreviewUrl(localPreview);
      setPendingImageFile(convertedFile);
      setIsImageMarkedForDelete(false);
    } catch {
      setError('root', {
        message: '이미지를 JPEG로 변환하는 중 오류가 발생했습니다.',
      });
    }
    event.target.value = '';
  };

  const handleMarkImageDelete = () => {
    clearErrors('root');
    setPendingImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setIsImageMarkedForDelete(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root');

    const password = values.password?.trim() ? values.password : undefined;
    const result = await updateProfileAction({
      name: values.name,
      nickname: values.nickname,
      password,
    });

    if (!result.ok) {
      setError('root', {
        message: result.message || '프로필 저장에 실패했습니다.',
      });
      return;
    }

    if (pendingImageFile || isImageMarkedForDelete) {
      setIsUploading(true);

      try {
        if (pendingImageFile) {
          const formData = new FormData();
          formData.append('file', pendingImageFile);
          const uploadResult = await uploadProfileImageAction(formData);

          if (!uploadResult.ok || !uploadResult.data) {
            const message = uploadResult.ok
              ? '프로필 정보는 저장되었지만 이미지 업로드에 실패했습니다.'
              : uploadResult.message ||
                '프로필 정보는 저장되었지만 이미지 업로드에 실패했습니다.';
            setError('root', { message });
            return;
          }

          setProfileImageUrl(uploadResult.data.profileImageUrl);
          setPendingImageFile(null);
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
        }

        if (isImageMarkedForDelete) {
          const deleteResult = await deleteProfileImageAction();
          if (!deleteResult.ok) {
            setError('root', {
              message:
                deleteResult.message ||
                '프로필 정보는 저장되었지만 이미지 삭제에 실패했습니다.',
            });
            return;
          }

          setProfileImageUrl(null);
          setIsImageMarkedForDelete(false);
        }
      } finally {
        setIsUploading(false);
      }
    }

    toast.success('프로필이 저장되었습니다.');
    router.push('/dashboard/profile');
  });

  const displayProfileImage = isImageMarkedForDelete
    ? '/profileImage.png'
    : previewUrl || profileImageUrl || '/profileImage.png';
  const canDeleteImage =
    !!(previewUrl || profileImageUrl) && !isImageMarkedForDelete;

  return (
    <div className={styles.container}>
      <PlainTopNav
        title="프로필 수정"
        rightLabel="완료"
        rightAriaLabel="완료"
        onRightAction={onSubmit}
        rightDisabled={isSubmitting || isUploading}
      />
      <div className={styles.content}>
        <div
          className={styles.profileImageButton}
          aria-label="프로필 이미지 영역">
          <Image
            src={displayProfileImage}
            alt="프로필 이미지"
            width={160}
            height={160}
            className={styles.profileImage}
            unoptimized={displayProfileImage.startsWith('blob:')}
          />
          <button
            type="button"
            className={styles.cameraBadge}
            aria-label="프로필 이미지 업로드"
            onClick={() => fileInputRef.current?.click()}>
            <CameraIcon className={styles.cameraIcon} />
          </button>
          {canDeleteImage ? (
            <button
              type="button"
              className={styles.deleteBadge}
              onClick={handleMarkImageDelete}
              aria-label="프로필 이미지 삭제">
              <TrashIcon className={styles.deleteIcon} />
            </button>
          ) : null}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className={styles.fileInput}
          onChange={handleUploadProfileImage}
        />

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.fieldLabel}>이름</div>
          <Input
            {...register('name')}
            type="text"
            placeholder="이름"
            disabled={isSubmitting || isUploading}
            error={errors.name?.message}
          />

          <div className={styles.fieldLabel}>닉네임</div>
          <Input
            {...register('nickname')}
            type="text"
            placeholder="닉네임"
            disabled={isSubmitting || isUploading}
            error={errors.nickname?.message}
          />

          <div className={styles.fieldLabel}>새 비밀번호</div>
          <Input
            {...register('password')}
            type="password"
            placeholder="************"
            disabled={isSubmitting || isUploading}
            error={errors.password?.message}
          />

          <div className={styles.fieldLabel}>비밀번호 확인</div>
          <Input
            {...register('passwordConfirm')}
            type="password"
            placeholder="************"
            disabled={isSubmitting || isUploading}
            error={errors.passwordConfirm?.message}
          />

          <FormError message={errors.root?.message} />
        </form>
      </div>
    </div>
  );
}
