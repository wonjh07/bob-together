begin;

-- Keep anon access only for pre-auth email duplication checks.
-- All other public functions are auth-required and should not be callable by anon.
revoke all on function public.clear_user_profile_image_transactional(p_user_id uuid) from anon;
revoke all on function public.create_appointment_with_owner_member(p_user_id uuid, p_group_id uuid, p_title text, p_start_at timestamp with time zone, p_ends_at timestamp with time zone, p_place_kakao_id text, p_place_name text, p_place_address text, p_place_category text, p_place_latitude double precision, p_place_longitude double precision) from anon;
revoke all on function public.create_group_transactional(p_owner_id uuid, p_group_name text) from anon;
revoke all on function public.delete_my_review_transactional(p_user_id uuid, p_appointment_id uuid, p_edited_at timestamp with time zone) from anon;
revoke all on function public.get_appointment_comments_with_cursor(p_user_id uuid, p_appointment_id uuid, p_limit integer, p_cursor_created_at timestamp with time zone, p_cursor_comment_id uuid, p_include_count boolean) from anon;
revoke all on function public.get_appointment_detail_with_count(p_user_id uuid, p_appointment_id uuid) from anon;
revoke all on function public.get_appointment_invitation_state_transactional(p_user_id uuid, p_appointment_id uuid) from anon;
revoke all on function public.get_appointment_members_with_count(p_user_id uuid, p_appointment_id uuid) from anon;
revoke all on function public.get_appointment_review_target_transactional(p_user_id uuid, p_appointment_id uuid) from anon;
revoke all on function public.get_group_members_with_count(p_user_id uuid, p_group_id uuid) from anon;
revoke all on function public.get_place_detail_with_stats(p_place_id uuid) from anon;
revoke all on function public.handle_new_auth_user() from anon;
revoke all on function public.join_appointment_transactional(p_user_id uuid, p_appointment_id uuid) from anon;
revoke all on function public.join_group_transactional(p_user_id uuid, p_group_id uuid) from anon;
revoke all on function public.leave_appointment_transactional(p_user_id uuid, p_appointment_id uuid) from anon;
revoke all on function public.leave_group_transactional(p_user_id uuid, p_group_id uuid) from anon;
revoke all on function public.list_appointment_history_with_stats(p_user_id uuid, p_offset integer, p_limit integer) from anon;
revoke all on function public.list_appointment_history_with_stats_cursor(p_user_id uuid, p_limit integer, p_cursor_ends_at timestamp with time zone, p_cursor_appointment_id uuid) from anon;
revoke all on function public.list_appointments_with_stats(p_user_id uuid, p_group_id uuid, p_period text, p_type text, p_cursor timestamp with time zone, p_limit integer) from anon;
revoke all on function public.list_appointments_with_stats_cursor(p_user_id uuid, p_group_id uuid, p_period text, p_type text, p_cursor_start_at timestamp with time zone, p_cursor_appointment_id uuid, p_limit integer) from anon;
revoke all on function public.list_my_comments_with_cursor(p_limit integer, p_cursor_created_at timestamp with time zone, p_cursor_comment_id uuid) from anon;
revoke all on function public.list_my_groups_with_stats(p_user_id uuid, p_limit integer, p_cursor_joined_at timestamp with time zone, p_cursor_group_id uuid) from anon;
revoke all on function public.list_my_reviews_with_cursor(p_limit integer, p_cursor_updated_at timestamp with time zone, p_cursor_review_id uuid) from anon;
revoke all on function public.list_place_reviews_with_cursor(p_place_id uuid, p_limit integer, p_cursor_updated_at timestamp with time zone, p_cursor_review_id uuid) from anon;
revoke all on function public.list_received_invitations_with_cursor(p_limit integer, p_cursor_created_time timestamp with time zone, p_cursor_invitation_id uuid) from anon;
revoke all on function public.list_reviewable_appointments_with_stats(p_user_id uuid, p_offset integer, p_limit integer) from anon;
revoke all on function public.list_reviewable_appointments_with_stats_cursor(p_user_id uuid, p_limit integer, p_cursor_ends_at timestamp with time zone, p_cursor_appointment_id uuid) from anon;
revoke all on function public.respond_to_invitation_transactional(p_user_id uuid, p_invitation_id uuid, p_decision text) from anon;
revoke all on function public.rls_auto_enable() from anon;
revoke all on function public.search_appointment_invitable_users_transactional(p_inviter_id uuid, p_appointment_id uuid, p_query text, p_limit integer, p_candidate_limit integer) from anon;
revoke all on function public.search_appointments_with_count(p_user_id uuid, p_query text, p_limit integer, p_cursor_start_at timestamp with time zone, p_cursor_appointment_id uuid) from anon;
revoke all on function public.search_group_invitable_users_transactional(p_inviter_id uuid, p_group_id uuid, p_query text, p_limit integer, p_candidate_limit integer) from anon;
revoke all on function public.search_groups_with_count(p_user_id uuid, p_query text, p_limit integer, p_cursor_name text, p_cursor_group_id uuid) from anon;
revoke all on function public.send_appointment_invitation_transactional(p_inviter_id uuid, p_appointment_id uuid, p_invitee_id uuid) from anon;
revoke all on function public.send_group_invitation_transactional(p_inviter_id uuid, p_group_id uuid, p_invitee_id uuid) from anon;
revoke all on function public.set_updated_at() from anon;
revoke all on function public.set_user_profile_image_transactional(p_user_id uuid, p_profile_image text) from anon;
revoke all on function public.submit_place_review_transactional(p_user_id uuid, p_appointment_id uuid, p_score integer, p_content text, p_edited_at timestamp with time zone) from anon;
revoke all on function public.update_appointment_status_transactional(p_user_id uuid, p_appointment_id uuid, p_status text) from anon;
revoke all on function public.update_appointment_transactional(p_user_id uuid, p_appointment_id uuid, p_title text, p_start_at timestamp with time zone, p_ends_at timestamp with time zone, p_place_id uuid, p_place_kakao_id text, p_place_name text, p_place_address text, p_place_category text, p_place_latitude double precision, p_place_longitude double precision) from anon;

commit;
