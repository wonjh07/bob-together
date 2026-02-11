import { createAppointmentCommentAction } from './createAppointmentCommentAction';

describe('createAppointmentCommentAction', () => {
  it('빈 댓글은 invalid-format을 반환한다', async () => {
    const result = await createAppointmentCommentAction({
      appointmentId: '550e8400-e29b-41d4-a716-446655440000',
      content: '   ',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '댓글을 입력해주세요.',
    });
  });
});
