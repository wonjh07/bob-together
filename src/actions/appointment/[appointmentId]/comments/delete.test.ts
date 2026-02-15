import { deleteAppointmentCommentAction } from './delete';

describe('deleteAppointmentCommentAction', () => {
  it('잘못된 약속 ID 형식이면 invalid-format을 반환한다', async () => {
    const result = await deleteAppointmentCommentAction({
      appointmentId: 'not-uuid',
      commentId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });

  it('잘못된 댓글 ID 형식이면 invalid-format을 반환한다', async () => {
    const result = await deleteAppointmentCommentAction({
      appointmentId: '550e8400-e29b-41d4-a716-446655440000',
      commentId: 'not-uuid',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 댓글 ID가 아닙니다.',
    });
  });
});
