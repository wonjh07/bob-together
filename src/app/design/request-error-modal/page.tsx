'use client';

import { useRequestErrorModal } from '@/hooks/useRequestErrorModal';

import * as styles from './page.css';

interface ErrorMockAction {
  label: string;
  message: string;
  source: string;
  err: unknown;
}

interface ErrorMockGroup {
  title: string;
  description: string;
  actions: ErrorMockAction[];
}

const PAGE_ERROR_MOCKS: ErrorMockGroup[] = [
  {
    title: '온보딩 / 로그인',
    description: '로그인과 리다이렉트 단계에서 발생 가능한 주요 요청 실패',
    actions: [
      {
        label: '로그인 실패 (자격 증명 오류)',
        message: '로그인에 실패했습니다.',
        source: 'onboarding/login.submit',
        err: {
          code: 'invalid-credentials',
          message: 'Invalid login credentials',
          status: 400,
        },
      },
      {
        label: '로그인 리다이렉트 실패',
        message: '로그인 후 이동 처리 중 오류가 발생했습니다.',
        source: 'onboarding/login.redirect',
        err: {
          code: 'redirect-failed',
          message: 'Failed to resolve next destination',
        },
      },
    ],
  },
  {
    title: '온보딩 / 그룹',
    description: '그룹 생성/가입 과정의 액션 실패',
    actions: [
      {
        label: '그룹 생성 실패',
        message: '그룹 생성에 실패했습니다.',
        source: 'onboarding/group.create',
        err: {
          code: 'server-error',
          message: 'RPC create_group_with_owner failed',
          details: 'duplicate key value violates unique constraint',
        },
      },
      {
        label: '그룹 가입 실패',
        message: '그룹 가입 처리 중 오류가 발생했습니다.',
        source: 'onboarding/group.join',
        err: {
          code: 'group-not-found',
          message: 'The target group does not exist',
          status: 404,
        },
      },
    ],
  },
  {
    title: '대시보드 / 약속',
    description: '대시보드 약속 조회 및 생성 시나리오',
    actions: [
      {
        label: '약속 리스트 조회 실패',
        message: '약속 목록을 불러오지 못했습니다.',
        source: 'dashboard/appointments.list',
        err: {
          code: 'db-timeout',
          message: 'statement timeout',
          hint: 'Retry the request',
        },
      },
      {
        label: '약속 생성 실패',
        message: '약속 생성 중 오류가 발생했습니다.',
        source: 'dashboard/appointments.create',
        err: {
          code: 'missing-group',
          message: 'Group is required to create appointment',
        },
      },
    ],
  },
  {
    title: '약속 상세 / 수정 / 댓글',
    description: '상세 진입 후 후속 액션 실패',
    actions: [
      {
        label: '약속 상세 조회 실패',
        message: '약속 상세를 불러오지 못했습니다.',
        source: 'appointments/detail.get',
        err: {
          code: 'not-found',
          message: 'Appointment not found',
          status: 404,
        },
      },
      {
        label: '약속 수정 실패',
        message: '약속 수정 중 오류가 발생했습니다.',
        source: 'appointments/edit.update',
        err: {
          code: 'forbidden',
          message: 'You are not owner of this appointment',
          status: 403,
        },
      },
      {
        label: '댓글 등록 실패',
        message: '댓글 등록 중 오류가 발생했습니다.',
        source: 'appointments/comments.create',
        err: {
          code: 'invalid-format',
          message: 'Comment content format is invalid',
          status: 400,
        },
      },
    ],
  },
  {
    title: '초대 / 알림',
    description: '초대 전송 및 응답 처리 실패',
    actions: [
      {
        label: '약속 멤버 초대 실패',
        message: '약속 멤버 초대 중 오류가 발생했습니다.',
        source: 'appointments/members.invite',
        err: {
          code: 'server-error',
          message: 'RPC invite_appointment_members failed',
          details: 'invalid user state',
        },
      },
      {
        label: '초대 수락 실패',
        message: '초대 수락에 실패했습니다.',
        source: 'notifications/invitations.accept',
        err: {
          code: 'appointment-ended',
          message: 'This appointment is already ended',
        },
      },
      {
        label: '초대 거절 실패',
        message: '초대 거절 처리 중 오류가 발생했습니다.',
        source: 'notifications/invitations.reject',
        err: {
          code: 'already-responded',
          message: 'Invitation has already been processed',
        },
      },
    ],
  },
  {
    title: '프로필 / 리뷰 / 이미지',
    description: '프로필 편집과 리뷰 작성 플로우의 요청 실패',
    actions: [
      {
        label: '프로필 저장 실패',
        message: '프로필 저장 중 오류가 발생했습니다.',
        source: 'profile/edit.update',
        err: {
          code: 'forbidden',
          message: 'User cannot update this profile',
        },
      },
      {
        label: '프로필 이미지 업로드 실패',
        message: '이미지 업로드 중 오류가 발생했습니다.',
        source: 'profile/edit.uploadImage',
        err: {
          code: '403',
          message: 'new row violates row-level security policy',
        },
      },
      {
        label: '리뷰 작성 실패',
        message: '리뷰 저장 중 오류가 발생했습니다.',
        source: 'profile/reviews.submit',
        err: {
          code: 'invalid-rating',
          message: 'Rating should be between 1 and 5',
          status: 400,
        },
      },
    ],
  },
  {
    title: '장소 / 검색',
    description: '장소 조회 및 검색 관련 요청 실패',
    actions: [
      {
        label: '장소 상세 조회 실패',
        message: '장소 정보를 불러오지 못했습니다.',
        source: 'places/detail.get',
        err: {
          code: 'server-error',
          message: 'RPC get_place_detail failed',
        },
      },
      {
        label: '검색 요청 실패',
        message: '검색 요청 처리 중 오류가 발생했습니다.',
        source: 'search/global.search',
        err: {
          code: 'rate-limit',
          message: 'Too many requests',
          status: 429,
        },
      },
    ],
  },
];

export default function RequestErrorModalPlaygroundPage() {
  const { openRequestError } = useRequestErrorModal();

  return (
    <main className={styles.page}>
      <div className={styles.headingWrap}>
        <h1 className={styles.title}>Request Error Modal Mock</h1>
        <p className={styles.description}>
          `openRequestError` 기준으로 페이지별 주요 요청 에러를 재현합니다.
        </p>
      </div>

      <div className={styles.sectionList}>
        {PAGE_ERROR_MOCKS.map((group) => (
          <section key={group.title} className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{group.title}</h2>
              <p className={styles.sectionDescription}>{group.description}</p>
            </div>

            <div className={styles.buttonGroup}>
              {group.actions.map((action) => (
                <button
                  key={`${group.title}-${action.label}`}
                  type="button"
                  className={styles.button}
                  onClick={() =>
                    openRequestError(action.message, {
                      source: action.source,
                      err: action.err,
                    })
                  }>
                  <span>{action.label}</span>
                  <code className={styles.sourceCode}>{`source: ${action.source}`}</code>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
