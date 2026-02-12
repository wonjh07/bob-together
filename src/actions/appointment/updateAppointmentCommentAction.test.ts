import { updateAppointmentCommentAction } from './updateAppointmentCommentAction';

describe('updateAppointmentCommentAction', () => {
  it('잘못된 약속 ID 형식이면 invalid-format을 반환한다', async () => {
    const result = await updateAppointmentCommentAction({
      appointmentId: 'not-uuid',
      commentId: '550e8400-e29b-41d4-a716-446655440000',
      content: '수정 댓글',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });

  it('빈 댓글이면 invalid-format을 반환한다', async () => {
    const result = await updateAppointmentCommentAction({
      appointmentId: '550e8400-e29b-41d4-a716-446655440000',
      commentId: '550e8400-e29b-41d4-a716-446655440001',
      content: '   ',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '댓글을 입력해주세요.',
    });
  });
});
