'use client';

import { useRequestError } from '@/hooks/useRequestError';
import { RequestError } from '@/libs/errors/request-error';

import * as styles from './page.css';

import type { ServiceErrorCode } from '@/actions/_common/service-action';
import type { ActionError } from '@/types/result';

type ErrorMockCase = {
  label: string;
  preview: string;
  input: unknown;
  options?: {
    fallbackMessage?: string;
    errorType?: ServiceErrorCode;
  };
};

type ErrorMockGroup = {
  title: string;
  description: string;
  cases: ErrorMockCase[];
};

function createActionError(params: {
  errorType: ServiceErrorCode;
  message: string;
  reason?: string;
  fieldErrors?: Record<string, string[]>;
  error?: unknown;
}): ActionError<ServiceErrorCode> {
  return {
    ok: false,
    errorType: params.errorType,
    message: params.message,
    reason: params.reason,
    fieldErrors: params.fieldErrors,
    error: params.error,
  };
}

function createRequestError(params: {
  errorType: ServiceErrorCode;
  message: string;
  reason?: string;
  fieldErrors?: Record<string, string[]>;
  error?: unknown;
}) {
  return new RequestError(
    createActionError({
      errorType: params.errorType,
      message: params.message,
      reason: params.reason,
      fieldErrors: params.fieldErrors,
      error: params.error,
    }),
  );
}

const ERROR_MOCK_GROUPS: ErrorMockGroup[] = [
  {
    title: 'ActionError 입력',
    description:
      '서버 액션 실패 객체를 그대로 `showRequestError`에 전달하는 현재 표준 경로입니다.',
    cases: [
      {
        label: '인증 실패',
        preview: "ActionError { errorType: 'auth', error.code: 'invalid_credentials' }",
        input: createActionError({
          errorType: 'auth',
          message: '로그인에 실패했습니다.',
          error: {
            code: 'invalid_credentials',
            message: 'Invalid login credentials',
          },
        }),
      },
      {
        label: '검증 실패',
        preview:
          "ActionError { errorType: 'validation', fieldErrors: { groupId: [...] } }",
        input: createActionError({
          errorType: 'validation',
          message: '그룹을 선택해주세요.',
          fieldErrors: {
            groupId: ['그룹을 선택해주세요.'],
          },
        }),
      },
      {
        label: '충돌 실패 + reason',
        preview:
          "ActionError { errorType: 'conflict', reason: 'already_invited', error.rpcErrorCode: 'already-invited' }",
        input: createActionError({
          errorType: 'conflict',
          message: '이미 초대된 사용자입니다.',
          reason: 'already_invited',
          error: {
            rpcErrorCode: 'already-invited',
          },
        }),
      },
    ],
  },
  {
    title: 'RequestError 입력',
    description:
      'queryFn에서 throw 되는 `RequestError`를 그대로 전달하는 경로입니다. 콘솔에서는 raw `error` 또는 wrapper 객체를 확인합니다.',
    cases: [
      {
        label: '상세 조회 권한 실패',
        preview:
          "RequestError(ActionError { errorType: 'permission', error.rpcErrorCode: 'forbidden' })",
        input: createRequestError({
          errorType: 'permission',
          message: '약속을 찾을 수 없거나 접근 권한이 없습니다.',
          error: {
            rpcErrorCode: 'forbidden',
            code: '42501',
          },
        }),
      },
      {
        label: '리스트 조회 서버 실패',
        preview:
          "RequestError(ActionError { errorType: 'server', error.code: '57014' })",
        input: createRequestError({
          errorType: 'server',
          message: '약속 목록을 불러오지 못했습니다.',
          error: {
            code: '57014',
            message: 'statement timeout',
            hint: 'Retry the request',
          },
        }),
      },
      {
        label: '빈 데이터 fallback',
        preview:
          "RequestError(ActionError { errorType: 'server', message: '데이터가 없습니다.' })",
        input: new RequestError({
          ok: false,
          errorType: 'server',
          message: '데이터가 없습니다.',
        }),
      },
    ],
  },
  {
    title: '문자열 입력',
    description:
      '단순 문구도 동일한 모달로 열 수 있습니다. 별도 타입이 없으면 기본 `server`를 사용하고, 필요하면 `errorType`을 직접 override 합니다.',
    cases: [
      {
        label: '기본 server 문구',
        preview: "showRequestError('약속 정보를 확인할 수 없습니다.') -> errorType: 'server'",
        input: '약속 정보를 확인할 수 없습니다.',
      },
      {
        label: 'validation 문구 override',
        preview:
          "showRequestError('약속 정보가 필요합니다.', { errorType: 'validation' })",
        input: '약속 정보가 필요합니다.',
        options: {
          errorType: 'validation',
        },
      },
      {
        label: 'fallback 문구 강제',
        preview:
          "showRequestError({ errorType: 'permission' }, { fallbackMessage: '권한이 없습니다.' })",
        input: {
          errorType: 'permission',
        },
        options: {
          fallbackMessage: '권한이 없습니다.',
        },
      },
    ],
  },
];

export default function RequestErrorModalPlaygroundPage() {
  const { showRequestError } = useRequestError();

  const handleMockClick = (mockCase: ErrorMockCase) => {
    showRequestError(mockCase.input, {
      fallbackMessage:
        mockCase.options?.fallbackMessage ?? '요청 처리에 실패했습니다.',
      errorType: mockCase.options?.errorType,
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.headingWrap}>
        <h1 className={styles.title}>Request Error Playground</h1>
        <p className={styles.description}>
          현재 요청 에러 구조는 `message + errorType`을 기준으로 통일되어 있습니다.
          raw `error.code`와 `rpcErrorCode`는 콘솔 디버깅용 보조 정보입니다.
        </p>
      </div>

      <div className={styles.sectionList}>
        {ERROR_MOCK_GROUPS.map((group) => (
          <section key={group.title} className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{group.title}</h2>
              <p className={styles.sectionDescription}>{group.description}</p>
            </div>

            <div className={styles.buttonGroup}>
              {group.cases.map((mockCase) => (
                <button
                  key={`${group.title}-${mockCase.label}`}
                  type="button"
                  className={styles.button}
                  onClick={() => handleMockClick(mockCase)}>
                  <span>{mockCase.label}</span>
                  <span className={styles.sourceCode}>{mockCase.preview}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
