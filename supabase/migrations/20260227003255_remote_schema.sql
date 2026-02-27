


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."appointment_member_role" AS ENUM (
    'owner',
    'member'
);


ALTER TYPE "public"."appointment_member_role" OWNER TO "postgres";


CREATE TYPE "public"."appointment_status" AS ENUM (
    'pending',
    'canceled'
);


ALTER TYPE "public"."appointment_status" OWNER TO "postgres";


CREATE TYPE "public"."group_member_role" AS ENUM (
    'owner',
    'member'
);


ALTER TYPE "public"."group_member_role" OWNER TO "postgres";


CREATE TYPE "public"."invitation_status" AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'canceled'
);


ALTER TYPE "public"."invitation_status" OWNER TO "postgres";


CREATE TYPE "public"."invitation_type" AS ENUM (
    'group',
    'appointment'
);


ALTER TYPE "public"."invitation_type" OWNER TO "postgres";


CREATE TYPE "public"."notification_target_type" AS ENUM (
    'group',
    'appointment'
);


ALTER TYPE "public"."notification_target_type" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'invite',
    'review',
    'confirmed',
    'comment'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_email_exists"("p_email" "text") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists(
    select 1
    from public.users
    where lower(email) = lower(trim(p_email))
  );
$$;


ALTER FUNCTION "public"."check_email_exists"("p_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clear_user_profile_image_transactional"("p_user_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text", "previous_profile_image" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_previous_profile_image text;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::text;
    return;
  end if;

  if p_user_id is null then
    return query select false, 'invalid-format', null::text;
    return;
  end if;

  select u.profile_image
  into v_previous_profile_image
  from public.users u
  where u.user_id = p_user_id
  for update;

  if not found then
    return query select false, 'not-found', null::text;
    return;
  end if;

  begin
    update public.users u
    set profile_image = null
    where u.user_id = p_user_id;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden', null::text;
      return;
    when others then
      return query select false, 'server-error', null::text;
      return;
  end;

  return query select true, null::text, v_previous_profile_image;
end;
$$;


ALTER FUNCTION "public"."clear_user_profile_image_transactional"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_appointment_with_owner_member"("p_user_id" "uuid", "p_group_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text" DEFAULT ''::"text", "p_place_latitude" double precision DEFAULT NULL::double precision, "p_place_longitude" double precision DEFAULT NULL::double precision) RETURNS TABLE("appointment_id" "uuid", "place_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_place_id uuid;
  v_appointment_id uuid;
  v_group_id uuid;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'invalid user context'
      using errcode = '42501';
  end if;

  v_group_id := p_group_id;

  if v_group_id is null then
    select gm.group_id
    into v_group_id
    from public.group_members gm
    where gm.user_id = p_user_id
    order by gm.joined_at desc
    limit 1;

    if v_group_id is null then
      raise exception 'missing-group'
        using errcode = 'P0001';
    end if;
  end if;

  if not exists (
    select 1
    from public.group_members gm
    where gm.group_id = v_group_id
      and gm.user_id = p_user_id
  ) then
    raise exception 'group membership required'
      using errcode = '42501';
  end if;

  insert into public.places (
    kakao_id,
    name,
    address,
    category,
    latitude,
    longitude
  )
  values (
    p_place_kakao_id,
    p_place_name,
    p_place_address,
    coalesce(p_place_category, ''),
    p_place_latitude,
    p_place_longitude
  )
  on conflict (kakao_id) do update
    set
      name = excluded.name,
      address = excluded.address,
      category = excluded.category,
      latitude = excluded.latitude,
      longitude = excluded.longitude
  returning places.place_id into v_place_id;

  insert into public.appointments (
    title,
    creator_id,
    group_id,
    start_at,
    ends_at,
    place_id,
    status
  )
  values (
    p_title,
    p_user_id,
    v_group_id,
    p_start_at,
    p_ends_at,
    v_place_id,
    'pending'
  )
  returning appointments.appointment_id into v_appointment_id;

  insert into public.appointment_members (
    appointment_id,
    user_id,
    role
  )
  values (
    v_appointment_id,
    p_user_id,
    'owner'
  );

  return query
    select v_appointment_id, v_place_id;
end;
$$;


ALTER FUNCTION "public"."create_appointment_with_owner_member"("p_user_id" "uuid", "p_group_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text", "p_place_latitude" double precision, "p_place_longitude" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_group_transactional"("p_owner_id" "uuid", "p_group_name" "text") RETURNS TABLE("ok" boolean, "error_code" "text", "group_id" "uuid", "group_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_normalized_name text;
  v_created_group_id uuid;
  v_constraint_name text;
begin
  if p_owner_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid, null::text;
    return;
  end if;

  if p_owner_id is null then
    return query select false, 'invalid-format', null::uuid, null::text;
    return;
  end if;

  if not exists (
    select 1
    from public.users u
    where u.user_id = p_owner_id
  ) then
    return query select false, 'user-not-found', null::uuid, null::text;
    return;
  end if;

  v_normalized_name := btrim(coalesce(p_group_name, ''));

  if v_normalized_name = '' then
    return query select false, 'invalid-format', null::uuid, null::text;
    return;
  end if;

  if exists (
    select 1
    from public.groups g
    where g.name = v_normalized_name
    limit 1
  ) then
    return query select false, 'group-name-taken', null::uuid, null::text;
    return;
  end if;

  begin
    insert into public.groups (
      name,
      owner_id
    )
    values (
      v_normalized_name,
      p_owner_id
    )
    returning groups.group_id
    into v_created_group_id;
  exception
    when unique_violation then
      return query select false, 'group-name-taken', null::uuid, null::text;
      return;
    when foreign_key_violation then
      get stacked diagnostics v_constraint_name = CONSTRAINT_NAME;
      if v_constraint_name = 'groups_owner_id_fkey' then
        return query select false, 'user-not-found', null::uuid, null::text;
      else
        return query select false, 'server-error:' || SQLSTATE, null::uuid, null::text;
      end if;
      return;
    when not_null_violation or check_violation or invalid_text_representation or string_data_right_truncation then
      return query select false, 'invalid-format', null::uuid, null::text;
      return;
    when insufficient_privilege then
      return query select false, 'forbidden', null::uuid, null::text;
      return;
    when others then
      return query select false, 'server-error:' || SQLSTATE, null::uuid, null::text;
      return;
  end;

  begin
    insert into public.group_members (
      group_id,
      user_id,
      role
    )
    values (
      v_created_group_id,
      p_owner_id,
      'owner'
    )
    on conflict on constraint group_members_pkey do nothing;
  exception
    when foreign_key_violation then
      get stacked diagnostics v_constraint_name = CONSTRAINT_NAME;
      delete from public.groups g where g.group_id = v_created_group_id;
      if v_constraint_name = 'group_members_user_id_fkey' then
        return query select false, 'user-not-found', null::uuid, null::text;
      elsif v_constraint_name = 'group_members_group_id_fkey' then
        return query select false, 'group-not-found', null::uuid, null::text;
      else
        return query select false, 'server-error:' || SQLSTATE, null::uuid, null::text;
      end if;
      return;
    when not_null_violation or check_violation or invalid_text_representation or string_data_right_truncation then
      delete from public.groups g where g.group_id = v_created_group_id;
      return query select false, 'invalid-format', null::uuid, null::text;
      return;
    when insufficient_privilege then
      delete from public.groups g where g.group_id = v_created_group_id;
      return query select false, 'forbidden', null::uuid, null::text;
      return;
    when others then
      delete from public.groups g where g.group_id = v_created_group_id;
      return query select false, 'server-error:' || SQLSTATE, null::uuid, null::text;
      return;
  end;

  return query
    select true, null::text, v_created_group_id, v_normalized_name;
end;
$$;


ALTER FUNCTION "public"."create_group_transactional"("p_owner_id" "uuid", "p_group_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_my_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_edited_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("ok" boolean, "error_code" "text", "appointment_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_review public.user_review%rowtype;
  v_edited_at timestamptz;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid;
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format', null::uuid;
    return;
  end if;

  v_edited_at := coalesce(p_edited_at, now());

  begin
    select *
    into v_review
    from public.user_review ur
    where ur.user_id = p_user_id
      and ur.appointment_id = p_appointment_id
    limit 1
    for update;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden', null::uuid;
      return;
    when others then
      return query select false, 'server-error-read', null::uuid;
      return;
  end;

  if not found
    or (
      v_review.score is null
      and (
        v_review.review is null
        or btrim(v_review.review) = ''
      )
    ) then
    return query select true, null::text, p_appointment_id;
    return;
  end if;

  begin
    update public.user_review ur
    set
      score = null,
      review = null,
      edited_at = v_edited_at
    where ur.review_id = v_review.review_id;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden', null::uuid;
      return;
    when others then
      return query select false, 'server-error-update', null::uuid;
      return;
  end;

  return query select true, null::text, p_appointment_id;
end;
$$;


ALTER FUNCTION "public"."delete_my_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_edited_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_appointment_comments_with_cursor"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_limit" integer DEFAULT 20, "p_cursor_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_comment_id" "uuid" DEFAULT NULL::"uuid", "p_include_count" boolean DEFAULT true) RETURNS TABLE("ok" boolean, "error_code" "text", "comment_count" integer, "comments" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_limit integer;
  v_comment_count integer := 0;
  v_comments jsonb;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', 0, '[]'::jsonb;
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format', 0, '[]'::jsonb;
    return;
  end if;

  if (p_cursor_created_at is null) <> (p_cursor_comment_id is null) then
    return query select false, 'invalid-format', 0, '[]'::jsonb;
    return;
  end if;

  if not exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_user_id
  ) then
    return query select false, 'forbidden', 0, '[]'::jsonb;
    return;
  end if;

  v_limit := greatest(coalesce(p_limit, 20), 1);

  if coalesce(p_include_count, true) then
    select
      count(*)::integer
    into v_comment_count
    from public.appointment_comments ac
    where ac.appointment_id = p_appointment_id
      and ac.is_deleted = false
      and ac.deleted_at is null;
  end if;

  with rows as (
    select
      ac.comment_id,
      ac.content,
      ac.created_at,
      ac.user_id,
      u.name,
      u.nickname,
      u.profile_image
    from public.appointment_comments ac
    left join public.users u
      on u.user_id = ac.user_id
    where ac.appointment_id = p_appointment_id
      and ac.is_deleted = false
      and ac.deleted_at is null
      and (
        p_cursor_created_at is null
        or ac.created_at < p_cursor_created_at
        or (
          ac.created_at = p_cursor_created_at
          and ac.comment_id < p_cursor_comment_id
        )
      )
    order by ac.created_at desc, ac.comment_id desc
    limit v_limit + 1
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'comment_id', r.comment_id,
          'content', r.content,
          'created_at', r.created_at,
          'user_id', r.user_id,
          'name', r.name,
          'nickname', r.nickname,
          'profile_image', r.profile_image
        )
        order by r.created_at desc, r.comment_id desc
      ),
      '[]'::jsonb
    )
  into v_comments
  from rows r;

  return query select true, null::text, coalesce(v_comment_count, 0), v_comments;
exception
  when insufficient_privilege then
    return query select false, 'forbidden', 0, '[]'::jsonb;
  when others then
    return query select false, 'server-error', 0, '[]'::jsonb;
end;
$$;


ALTER FUNCTION "public"."get_appointment_comments_with_cursor"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_limit" integer, "p_cursor_created_at" timestamp with time zone, "p_cursor_comment_id" "uuid", "p_include_count" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_appointment_detail_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") RETURNS TABLE("appointment_id" "uuid", "title" "text", "status" "public"."appointment_status", "start_at" timestamp with time zone, "ends_at" timestamp with time zone, "created_at" timestamp with time zone, "creator_id" "uuid", "creator_name" "text", "creator_nickname" "text", "creator_profile_image" "text", "place_id" "uuid", "place_name" "text", "place_address" "text", "place_category" "text", "place_latitude" double precision, "place_longitude" double precision, "member_count" bigint, "is_member" boolean, "review_avg" numeric, "review_count" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    a.appointment_id,
    a.title,
    a.status,
    a.start_at,
    a.ends_at,
    a.created_at,
    a.creator_id,
    u.name as creator_name,
    u.nickname as creator_nickname,
    u.profile_image as creator_profile_image,
    p.place_id,
    p.name as place_name,
    p.address as place_address,
    p.category as place_category,
    p.latitude as place_latitude,
    p.longitude as place_longitude,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = a.appointment_id
    ) as member_count,
    exists (
      select 1
      from public.appointment_members am_me
      where am_me.appointment_id = a.appointment_id
        and am_me.user_id = p_user_id
    ) as is_member,
    pr.review_avg,
    pr.review_count
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join public.users u
    on u.user_id = a.creator_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = a.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  where a.appointment_id = p_appointment_id
    and exists (
      select 1
      from public.group_members gm_access
      where gm_access.group_id = a.group_id
        and gm_access.user_id = p_user_id
    )
  limit 1;
$$;


ALTER FUNCTION "public"."get_appointment_detail_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_appointment_invitation_state_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text", "member_ids" "uuid"[], "pending_invitee_ids" "uuid"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_member_ids uuid[];
  v_pending_ids uuid[];
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid[], null::uuid[];
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format', null::uuid[], null::uuid[];
    return;
  end if;

  if not exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_user_id
  ) then
    return query select false, 'forbidden', null::uuid[], null::uuid[];
    return;
  end if;

  select
    coalesce(array_agg(distinct am.user_id), '{}'::uuid[])
  into v_member_ids
  from public.appointment_members am
  where am.appointment_id = p_appointment_id;

  select
    coalesce(array_agg(distinct i.invitee_id), '{}'::uuid[])
  into v_pending_ids
  from public.invitations i
  where i.appointment_id = p_appointment_id
    and i.type = 'appointment'
    and i.status = 'pending';

  return query
    select true, null::text, v_member_ids, v_pending_ids;
end;
$$;


ALTER FUNCTION "public"."get_appointment_invitation_state_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_appointment_members_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text", "member_count" integer, "members" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_member_count integer;
  v_members jsonb;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', 0, '[]'::jsonb;
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format', 0, '[]'::jsonb;
    return;
  end if;

  if not exists (
    select 1
    from public.appointments a
    join public.group_members gm
      on gm.group_id = a.group_id
     and gm.user_id = p_user_id
    where a.appointment_id = p_appointment_id
  ) then
    return query select false, 'forbidden', 0, '[]'::jsonb;
    return;
  end if;

  select
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'user_id', mr.user_id,
          'role', mr.role,
          'name', mr.name,
          'nickname', mr.nickname,
          'profile_image', mr.profile_image
        )
        order by mr.joined_at asc
      ),
      '[]'::jsonb
    )
  into
    v_member_count,
    v_members
  from (
    select
      am.user_id,
      am.role,
      am.joined_at,
      u.name,
      u.nickname,
      u.profile_image
    from public.appointment_members am
    left join public.users u
      on u.user_id = am.user_id
    where am.appointment_id = p_appointment_id
  ) mr;

  return query select true, null::text, coalesce(v_member_count, 0), v_members;
exception
  when insufficient_privilege then
    return query select false, 'forbidden', 0, '[]'::jsonb;
  when others then
    return query select false, 'server-error', 0, '[]'::jsonb;
end;
$$;


ALTER FUNCTION "public"."get_appointment_members_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_appointment_review_target_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text", "appointment_id" "uuid", "title" "text", "start_at" timestamp with time zone, "ends_at" timestamp with time zone, "place_id" "uuid", "place_name" "text", "place_address" "text", "place_category" "text", "review_avg" double precision, "review_count" bigint, "my_score" integer, "my_review" "text", "has_my_review_row" boolean, "has_reviewed" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_appointment public.appointments%rowtype;
  v_place public.places%rowtype;
  v_review_avg double precision;
  v_review_count bigint;
  v_my_score integer;
  v_my_review text;
  v_has_my_review_row boolean;
begin
  if p_user_id is distinct from auth.uid() then
    return query
      select
        false,
        'forbidden',
        null::uuid,
        null::text,
        null::timestamptz,
        null::timestamptz,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::double precision,
        null::bigint,
        null::integer,
        null::text,
        null::boolean,
        null::boolean;
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query
      select
        false,
        'invalid-format',
        null::uuid,
        null::text,
        null::timestamptz,
        null::timestamptz,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::double precision,
        null::bigint,
        null::integer,
        null::text,
        null::boolean,
        null::boolean;
    return;
  end if;

  select *
  into v_appointment
  from public.appointments a
  where a.appointment_id = p_appointment_id;

  if not found then
    return query
      select
        false,
        'forbidden-not-found',
        null::uuid,
        null::text,
        null::timestamptz,
        null::timestamptz,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::double precision,
        null::bigint,
        null::integer,
        null::text,
        null::boolean,
        null::boolean;
    return;
  end if;

  if v_appointment.status = 'canceled' or v_appointment.ends_at > now() then
    return query
      select
        false,
        'forbidden-not-ended',
        null::uuid,
        null::text,
        null::timestamptz,
        null::timestamptz,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::double precision,
        null::bigint,
        null::integer,
        null::text,
        null::boolean,
        null::boolean;
    return;
  end if;

  if v_appointment.creator_id <> p_user_id and not exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_user_id
  ) then
    return query
      select
        false,
        'forbidden-no-permission',
        null::uuid,
        null::text,
        null::timestamptz,
        null::timestamptz,
        null::uuid,
        null::text,
        null::text,
        null::text,
        null::double precision,
        null::bigint,
        null::integer,
        null::text,
        null::boolean;
    return;
  end if;

  if v_appointment.place_id is not null then
    select *
    into v_place
    from public.places p
    where p.place_id = v_appointment.place_id;

    select
      round(avg(ur.score)::numeric, 1)::double precision,
      count(*)::bigint
    into
      v_review_avg,
      v_review_count
    from public.user_review ur
    where ur.place_id = v_appointment.place_id
      and ur.appointment_id is not null
      and (ur.score is not null or ur.review is not null);
  end if;

  select
    ur.score,
    ur.review
  into
    v_my_score,
    v_my_review
  from public.user_review ur
  where ur.appointment_id = p_appointment_id
    and ur.user_id = p_user_id
  limit 1;
  v_has_my_review_row := found;

  return query
    select
      true,
      null::text,
      v_appointment.appointment_id,
      v_appointment.title,
      v_appointment.start_at,
      v_appointment.ends_at,
      v_appointment.place_id,
      v_place.name,
      v_place.address,
      v_place.category,
      v_review_avg,
      coalesce(v_review_count, 0),
      v_my_score,
      v_my_review,
      v_has_my_review_row,
      (v_my_score is not null or (v_my_review is not null and btrim(v_my_review) <> ''));
end;
$$;


ALTER FUNCTION "public"."get_appointment_review_target_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_group_members_with_count"("p_user_id" "uuid", "p_group_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text", "member_count" integer, "members" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_member_count integer;
  v_members jsonb;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', 0, '[]'::jsonb;
    return;
  end if;

  if p_user_id is null or p_group_id is null then
    return query select false, 'invalid-format', 0, '[]'::jsonb;
    return;
  end if;

  if not exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_user_id
  ) then
    return query select false, 'forbidden', 0, '[]'::jsonb;
    return;
  end if;

  select
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'user_id', mr.user_id,
          'role', mr.role,
          'name', mr.name,
          'nickname', mr.nickname,
          'profile_image', mr.profile_image
        )
        order by mr.joined_at asc
      ),
      '[]'::jsonb
    )
  into
    v_member_count,
    v_members
  from (
    select
      gm.user_id,
      gm.role,
      gm.joined_at,
      u.name,
      u.nickname,
      u.profile_image
    from public.group_members gm
    left join public.users u
      on u.user_id = gm.user_id
    where gm.group_id = p_group_id
  ) mr;

  return query select true, null::text, coalesce(v_member_count, 0), v_members;
exception
  when insufficient_privilege then
    return query select false, 'forbidden', 0, '[]'::jsonb;
  when others then
    return query select false, 'server-error', 0, '[]'::jsonb;
end;
$$;


ALTER FUNCTION "public"."get_group_members_with_count"("p_user_id" "uuid", "p_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_place_detail_with_stats"("p_place_id" "uuid") RETURNS TABLE("place_id" "uuid", "name" "text", "address" "text", "category" "text", "latitude" double precision, "longitude" double precision, "review_avg" numeric, "review_count" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    p.place_id,
    p.name,
    p.address,
    p.category,
    p.latitude,
    p.longitude,
    rs.review_avg,
    rs.review_count
  from public.places p
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = p.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) rs on true
  where p.place_id = p_place_id
  limit 1;
$$;


ALTER FUNCTION "public"."get_place_detail_with_stats"("p_place_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.users (user_id, email, name, nickname, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'nickname', ''),
    now()
  )
  on conflict (user_id) do update
    set email = excluded.email;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_auth_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."join_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_group_id uuid;
  v_status public.appointment_status;
  v_ends_at timestamptz;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden';
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format';
    return;
  end if;

  select
    a.group_id,
    a.status,
    a.ends_at
  into
    v_group_id,
    v_status,
    v_ends_at
  from public.appointments a
  where a.appointment_id = p_appointment_id;

  if not found then
    return query select false, 'appointment-not-found';
    return;
  end if;

  if v_status = 'canceled' then
    return query select false, 'forbidden-appointment-canceled';
    return;
  end if;

  if v_ends_at <= now() then
    return query select false, 'forbidden-appointment-ended';
    return;
  end if;

  if not exists (
    select 1
    from public.group_members gm
    where gm.group_id = v_group_id
      and gm.user_id = p_user_id
  ) then
    return query select false, 'forbidden-not-group-member';
    return;
  end if;

  begin
    insert into public.appointment_members (
      appointment_id,
      user_id,
      role
    )
    values (
      p_appointment_id,
      p_user_id,
      'member'
    );
  exception
    when unique_violation then
      return query select false, 'already-member';
      return;
    when insufficient_privilege then
      return query select false, 'forbidden';
      return;
    when others then
      return query select false, 'server-error';
      return;
  end;

  return query select true, null::text;
end;
$$;


ALTER FUNCTION "public"."join_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."join_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text", "group_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_constraint_name text;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid;
    return;
  end if;

  if p_user_id is null or p_group_id is null then
    return query select false, 'invalid-format', null::uuid;
    return;
  end if;

  if not exists (
    select 1
    from public.users u
    where u.user_id = p_user_id
  ) then
    return query select false, 'user-not-found', null::uuid;
    return;
  end if;

  if not exists (
    select 1
    from public.groups g
    where g.group_id = p_group_id
  ) then
    return query select false, 'group-not-found', null::uuid;
    return;
  end if;

  begin
    insert into public.group_members (
      group_id,
      user_id,
      role
    )
    values (
      p_group_id,
      p_user_id,
      'member'
    )
    on conflict on constraint group_members_pkey do nothing;
  exception
    when foreign_key_violation then
      get stacked diagnostics v_constraint_name = CONSTRAINT_NAME;
      if v_constraint_name = 'group_members_user_id_fkey' then
        return query select false, 'user-not-found', null::uuid;
      elsif v_constraint_name = 'group_members_group_id_fkey' then
        return query select false, 'group-not-found', null::uuid;
      else
        return query select false, 'server-error:' || SQLSTATE, null::uuid;
      end if;
      return;
    when not_null_violation or check_violation or invalid_text_representation or string_data_right_truncation then
      return query select false, 'invalid-format', null::uuid;
      return;
    when insufficient_privilege then
      return query select false, 'forbidden', null::uuid;
      return;
    when others then
      return query select false, 'server-error:' || SQLSTATE, null::uuid;
      return;
  end;

  return query select true, null::text, p_group_id;
end;
$$;


ALTER FUNCTION "public"."join_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."leave_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_creator_id uuid;
  v_status public.appointment_status;
  v_ends_at timestamptz;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden';
    return;
  end if;

  if p_user_id is null or p_appointment_id is null then
    return query select false, 'invalid-format';
    return;
  end if;

  select
    a.creator_id,
    a.status,
    a.ends_at
  into
    v_creator_id,
    v_status,
    v_ends_at
  from public.appointments a
  where a.appointment_id = p_appointment_id
  for update;

  if not found then
    return query select false, 'appointment-not-found';
    return;
  end if;

  if v_creator_id = p_user_id then
    return query select false, 'forbidden-owner';
    return;
  end if;

  if v_status = 'canceled' then
    return query select false, 'forbidden-appointment-canceled';
    return;
  end if;

  if v_ends_at <= now() then
    return query select false, 'forbidden-appointment-ended';
    return;
  end if;

  begin
    delete from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_user_id;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden';
      return;
    when others then
      return query select false, 'server-error';
      return;
  end;

  return query select true, null::text;
end;
$$;


ALTER FUNCTION "public"."leave_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."leave_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text", "group_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_role text;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid;
    return;
  end if;

  if p_user_id is null or p_group_id is null then
    return query select false, 'invalid-format', null::uuid;
    return;
  end if;

  select gm.role
  into v_role
  from public.group_members gm
  where gm.group_id = p_group_id
    and gm.user_id = p_user_id
  for update;

  if not found then
    return query select true, null::text, p_group_id;
    return;
  end if;

  if v_role = 'owner' then
    return query select false, 'forbidden-owner', null::uuid;
    return;
  end if;

  begin
    delete from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_user_id;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden', null::uuid;
      return;
    when others then
      return query select false, 'server-error', null::uuid;
      return;
  end;

  return query select true, null::text, p_group_id;
end;
$$;


ALTER FUNCTION "public"."leave_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_appointment_history_with_stats"("p_user_id" "uuid", "p_offset" integer DEFAULT 0, "p_limit" integer DEFAULT 10) RETURNS TABLE("appointment_id" "uuid", "title" "text", "start_at" timestamp with time zone, "ends_at" timestamp with time zone, "creator_id" "uuid", "creator_name" "text", "creator_nickname" "text", "creator_profile_image" "text", "place_id" "uuid", "place_name" "text", "place_address" "text", "place_category" "text", "member_count" bigint, "review_avg" numeric, "review_count" bigint, "can_write_review" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  with history as (
    select
      a.appointment_id,
      a.title,
      a.start_at,
      a.ends_at,
      a.creator_id,
      a.place_id
    from public.appointments a
    where p_user_id = auth.uid()
      and a.status <> 'canceled'
      and a.ends_at <= now()
      and exists (
        select 1
        from public.appointment_members am
        where am.appointment_id = a.appointment_id
          and am.user_id = p_user_id
      )
    order by a.ends_at desc, a.appointment_id desc
    offset greatest(p_offset, 0)
    limit greatest(p_limit, 1) + 1
  )
  select
    h.appointment_id,
    h.title,
    h.start_at,
    h.ends_at,
    h.creator_id,
    u.name as creator_name,
    u.nickname as creator_nickname,
    u.profile_image as creator_profile_image,
    p.place_id,
    p.name as place_name,
    p.address as place_address,
    p.category as place_category,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = h.appointment_id
    ) as member_count,
    pr.review_avg,
    pr.review_count,
    not exists (
      select 1
      from public.user_review ur_me
      where ur_me.user_id = p_user_id
        and ur_me.appointment_id = h.appointment_id
        and (
          ur_me.score is not null
          or coalesce(btrim(ur_me.review), '') <> ''
        )
    ) as can_write_review
  from history h
  join public.places p
    on p.place_id = h.place_id
  left join public.users u
    on u.user_id = h.creator_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = h.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  order by h.ends_at desc, h.appointment_id desc;
$$;


ALTER FUNCTION "public"."list_appointment_history_with_stats"("p_user_id" "uuid", "p_offset" integer, "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_appointment_history_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer DEFAULT 10, "p_cursor_ends_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_appointment_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("appointment_id" "uuid", "title" "text", "start_at" timestamp with time zone, "ends_at" timestamp with time zone, "creator_id" "uuid", "creator_name" "text", "creator_nickname" "text", "creator_profile_image" "text", "place_id" "uuid", "place_name" "text", "place_address" "text", "place_category" "text", "member_count" bigint, "review_avg" numeric, "review_count" bigint, "can_write_review" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  with history as (
    select
      a.appointment_id,
      a.title,
      a.start_at,
      a.ends_at,
      a.creator_id,
      a.place_id
    from public.appointments a
    where p_user_id = auth.uid()
      and a.status <> 'canceled'
      and a.ends_at <= now()
      and exists (
        select 1
        from public.appointment_members am
        where am.appointment_id = a.appointment_id
          and am.user_id = p_user_id
      )
      and (
        p_cursor_ends_at is null
        or (
          a.ends_at,
          a.appointment_id
        ) < (
          p_cursor_ends_at,
          p_cursor_appointment_id
        )
      )
    order by a.ends_at desc, a.appointment_id desc
    limit greatest(coalesce(p_limit, 10), 1) + 1
  )
  select
    h.appointment_id,
    h.title,
    h.start_at,
    h.ends_at,
    h.creator_id,
    u.name as creator_name,
    u.nickname as creator_nickname,
    u.profile_image as creator_profile_image,
    p.place_id,
    p.name as place_name,
    p.address as place_address,
    p.category as place_category,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = h.appointment_id
    ) as member_count,
    pr.review_avg,
    pr.review_count,
    not exists (
      select 1
      from public.user_review ur_me
      where ur_me.user_id = p_user_id
        and ur_me.appointment_id = h.appointment_id
        and (
          ur_me.score is not null
          or coalesce(btrim(ur_me.review), '') <> ''
        )
    ) as can_write_review
  from history h
  join public.places p
    on p.place_id = h.place_id
  left join public.users u
    on u.user_id = h.creator_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = h.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  order by h.ends_at desc, h.appointment_id desc;
$$;


ALTER FUNCTION "public"."list_appointment_history_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer, "p_cursor_ends_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_appointments_with_stats"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text" DEFAULT 'all'::"text", "p_type" "text" DEFAULT 'all'::"text", "p_cursor" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_limit" integer DEFAULT 10) RETURNS TABLE("appointment_id" "uuid", "title" "text", "status" "public"."appointment_status", "start_at" timestamp with time zone, "ends_at" timestamp with time zone, "creator_id" "uuid", "creator_name" "text", "creator_nickname" "text", "place_id" "uuid", "place_name" "text", "place_address" "text", "place_category" "text", "member_count" bigint, "comment_count" bigint, "is_owner" boolean, "is_member" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    a.appointment_id,
    a.title,
    a.status,
    a.start_at,
    a.ends_at,
    a.creator_id,
    u.name as creator_name,
    u.nickname as creator_nickname,
    p.place_id,
    p.name as place_name,
    p.address as place_address,
    p.category as place_category,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = a.appointment_id
    ) as member_count,
    (
      select count(*)::bigint
      from public.appointment_comments ac_count
      where ac_count.appointment_id = a.appointment_id
        and ac_count.is_deleted = false
        and ac_count.deleted_at is null
    ) as comment_count,
    (a.creator_id = p_user_id) as is_owner,
    exists (
      select 1
      from public.appointment_members am_me
      where am_me.appointment_id = a.appointment_id
        and am_me.user_id = p_user_id
    ) as is_member
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join public.users u
    on u.user_id = a.creator_id
  where a.group_id = p_group_id
    and exists (
      select 1
      from public.group_members gm_access
      where gm_access.group_id = a.group_id
        and gm_access.user_id = p_user_id
    )
    and (
      p_period = 'all'
      or (p_period = 'today' and a.start_at >= date_trunc('day', now()))
      or (p_period = 'week' and a.start_at >= now() - interval '7 days')
      or (p_period = 'month' and a.start_at >= now() - interval '1 month')
    )
    and (
      p_type = 'all'
      or (p_type = 'created' and a.creator_id = p_user_id)
      or (
        p_type = 'joined'
        and a.creator_id <> p_user_id
        and exists (
          select 1
          from public.appointment_members am_joined
          where am_joined.appointment_id = a.appointment_id
            and am_joined.user_id = p_user_id
        )
      )
    )
    and (
      p_cursor is null
      or a.start_at < p_cursor
    )
  order by a.start_at desc
  limit greatest(p_limit, 1) + 1;
$$;


ALTER FUNCTION "public"."list_appointments_with_stats"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text", "p_type" "text", "p_cursor" timestamp with time zone, "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_appointments_with_stats_cursor"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text" DEFAULT 'all'::"text", "p_type" "text" DEFAULT 'all'::"text", "p_cursor_start_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_appointment_id" "uuid" DEFAULT NULL::"uuid", "p_limit" integer DEFAULT 10) RETURNS TABLE("appointment_id" "uuid", "title" "text", "status" "public"."appointment_status", "start_at" timestamp with time zone, "ends_at" timestamp with time zone, "creator_id" "uuid", "creator_name" "text", "creator_nickname" "text", "place_id" "uuid", "place_name" "text", "place_address" "text", "place_category" "text", "member_count" bigint, "comment_count" bigint, "is_owner" boolean, "is_member" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    a.appointment_id,
    a.title,
    a.status,
    a.start_at,
    a.ends_at,
    a.creator_id,
    u.name as creator_name,
    u.nickname as creator_nickname,
    p.place_id,
    p.name as place_name,
    p.address as place_address,
    p.category as place_category,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = a.appointment_id
    ) as member_count,
    (
      select count(*)::bigint
      from public.appointment_comments ac_count
      where ac_count.appointment_id = a.appointment_id
        and ac_count.is_deleted = false
        and ac_count.deleted_at is null
    ) as comment_count,
    (a.creator_id = p_user_id) as is_owner,
    exists (
      select 1
      from public.appointment_members am_me
      where am_me.appointment_id = a.appointment_id
        and am_me.user_id = p_user_id
    ) as is_member
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join public.users u
    on u.user_id = a.creator_id
  where a.group_id = p_group_id
    and exists (
      select 1
      from public.group_members gm_access
      where gm_access.group_id = a.group_id
        and gm_access.user_id = p_user_id
    )
    and (
      p_period = 'all'
      or (p_period = 'today' and a.start_at >= date_trunc('day', now()))
      or (p_period = 'week' and a.start_at >= now() - interval '7 days')
      or (p_period = 'month' and a.start_at >= now() - interval '1 month')
    )
    and (
      p_type = 'all'
      or (p_type = 'created' and a.creator_id = p_user_id)
      or (
        p_type = 'joined'
        and a.creator_id <> p_user_id
        and exists (
          select 1
          from public.appointment_members am_joined
          where am_joined.appointment_id = a.appointment_id
            and am_joined.user_id = p_user_id
        )
      )
    )
    and (
      p_cursor_start_at is null
      or (
        a.start_at,
        a.appointment_id
      ) < (
        p_cursor_start_at,
        p_cursor_appointment_id
      )
    )
  order by a.start_at desc, a.appointment_id desc
  limit greatest(coalesce(p_limit, 10), 1) + 1;
$$;


ALTER FUNCTION "public"."list_appointments_with_stats_cursor"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text", "p_type" "text", "p_cursor_start_at" timestamp with time zone, "p_cursor_appointment_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_my_comments_with_cursor"("p_limit" integer DEFAULT 10, "p_cursor_created_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_comment_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("comment_id" "uuid", "appointment_id" "uuid", "content" "text", "created_at" timestamp with time zone, "appointment_title" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    c.comment_id,
    c.appointment_id,
    c.content,
    c.created_at,
    a.title as appointment_title
  from public.appointment_comments c
  join public.appointments a on a.appointment_id = c.appointment_id
  where c.user_id = auth.uid()
    and c.is_deleted = false
    and c.deleted_at is null
    and (
      p_cursor_created_at is null
      or (
        c.created_at,
        c.comment_id
      ) < (
        p_cursor_created_at,
        p_cursor_comment_id
      )
    )
  order by c.created_at desc, c.comment_id desc
  limit greatest(coalesce(p_limit, 10), 1) + 1;
$$;


ALTER FUNCTION "public"."list_my_comments_with_cursor"("p_limit" integer, "p_cursor_created_at" timestamp with time zone, "p_cursor_comment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_my_groups_with_stats"("p_user_id" "uuid", "p_limit" integer DEFAULT 10, "p_cursor_joined_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_group_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("group_id" "uuid", "group_name" "text", "owner_name" "text", "owner_nickname" "text", "owner_profile_image" "text", "joined_at" timestamp with time zone, "created_at" timestamp with time zone, "member_count" bigint, "is_owner" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    g.group_id,
    g.name as group_name,
    u.name as owner_name,
    u.nickname as owner_nickname,
    u.profile_image as owner_profile_image,
    gm.joined_at,
    g.created_at,
    (
      select count(*)::bigint
      from public.group_members gm_count
      where gm_count.group_id = g.group_id
    ) as member_count,
    (gm.role = 'owner'::public.group_member_role) as is_owner
  from public.group_members gm
  join public.groups g on g.group_id = gm.group_id
  left join public.users u on u.user_id = g.owner_id
  where gm.user_id = p_user_id
    and (
      p_cursor_joined_at is null
      or gm.joined_at < p_cursor_joined_at
      or (gm.joined_at = p_cursor_joined_at and gm.group_id < p_cursor_group_id)
    )
  order by gm.joined_at desc, gm.group_id desc
  limit greatest(p_limit, 1) + 1;
$$;


ALTER FUNCTION "public"."list_my_groups_with_stats"("p_user_id" "uuid", "p_limit" integer, "p_cursor_joined_at" timestamp with time zone, "p_cursor_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_my_reviews_with_cursor"("p_limit" integer DEFAULT 10, "p_cursor_updated_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_review_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("review_id" "uuid", "appointment_id" "uuid", "place_id" "uuid", "score" smallint, "review" "text", "edited_at" timestamp with time zone, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "place_name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    ur.review_id,
    ur.appointment_id,
    ur.place_id,
    ur.score,
    ur.review,
    ur.edited_at,
    ur.created_at,
    ur.updated_at,
    p.name as place_name
  from public.user_review ur
  left join public.places p on p.place_id = ur.place_id
  where ur.user_id = auth.uid()
    and ur.appointment_id is not null
    and (ur.score is not null or ur.review is not null)
    and (
      p_cursor_updated_at is null
      or (
        ur.updated_at,
        ur.review_id
      ) < (
        p_cursor_updated_at,
        p_cursor_review_id
      )
    )
  order by ur.updated_at desc, ur.review_id desc
  limit greatest(coalesce(p_limit, 10), 1) + 1;
$$;


ALTER FUNCTION "public"."list_my_reviews_with_cursor"("p_limit" integer, "p_cursor_updated_at" timestamp with time zone, "p_cursor_review_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_place_reviews_with_cursor"("p_place_id" "uuid", "p_limit" integer DEFAULT 10, "p_cursor_updated_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_review_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("review_id" "uuid", "user_id" "uuid", "score" smallint, "review" "text", "edited_at" timestamp with time zone, "updated_at" timestamp with time zone, "user_name" "text", "user_nickname" "text", "user_profile_image" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    ur.review_id,
    ur.user_id,
    ur.score,
    ur.review,
    ur.edited_at,
    ur.updated_at,
    u.name as user_name,
    u.nickname as user_nickname,
    u.profile_image as user_profile_image
  from public.user_review ur
  join public.users u on u.user_id = ur.user_id
  where ur.place_id = p_place_id
    and ur.appointment_id is not null
    and (ur.score is not null or ur.review is not null)
    and (
      p_cursor_updated_at is null
      or (
        ur.updated_at,
        ur.review_id
      ) < (
        p_cursor_updated_at,
        p_cursor_review_id
      )
    )
  order by ur.updated_at desc, ur.review_id desc
  limit greatest(coalesce(p_limit, 10), 1) + 1;
$$;


ALTER FUNCTION "public"."list_place_reviews_with_cursor"("p_place_id" "uuid", "p_limit" integer, "p_cursor_updated_at" timestamp with time zone, "p_cursor_review_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_received_invitations_with_cursor"("p_limit" integer DEFAULT 10, "p_cursor_created_time" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_invitation_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("invitation_id" "uuid", "type" "text", "status" "text", "created_time" timestamp with time zone, "group_id" "uuid", "appointment_id" "uuid", "inviter_id" "uuid", "inviter_name" "text", "inviter_nickname" "text", "inviter_profile_image" "text", "group_name" "text", "appointment_title" "text", "appointment_ends_at" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    i.invitation_id,
    i.type::text,
    i.status::text,
    i.created_time,
    i.group_id,
    i.appointment_id,
    u.user_id as inviter_id,
    u.name as inviter_name,
    u.nickname as inviter_nickname,
    u.profile_image as inviter_profile_image,
    g.name as group_name,
    a.title as appointment_title,
    a.ends_at as appointment_ends_at
  from public.invitations i
  left join public.users u on u.user_id = i.inviter_id
  left join public.groups g on g.group_id = i.group_id
  left join public.appointments a on a.appointment_id = i.appointment_id
  where i.invitee_id = auth.uid()
    and i.status in ('pending', 'accepted', 'rejected')
    and (
      p_cursor_created_time is null
      or (
        i.created_time,
        i.invitation_id
      ) < (
        p_cursor_created_time,
        p_cursor_invitation_id
      )
    )
  order by i.created_time desc, i.invitation_id desc
  limit greatest(coalesce(p_limit, 10), 1) + 1;
$$;


ALTER FUNCTION "public"."list_received_invitations_with_cursor"("p_limit" integer, "p_cursor_created_time" timestamp with time zone, "p_cursor_invitation_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_reviewable_appointments_with_stats"("p_user_id" "uuid", "p_offset" integer DEFAULT 0, "p_limit" integer DEFAULT 6) RETURNS TABLE("appointment_id" "uuid", "title" "text", "start_at" timestamp with time zone, "ends_at" timestamp with time zone, "place_id" "uuid", "place_name" "text", "review_avg" numeric, "review_count" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    a.appointment_id,
    a.title,
    a.start_at,
    a.ends_at,
    p.place_id,
    p.name as place_name,
    pr.review_avg,
    pr.review_count
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = a.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  where a.status <> 'canceled'
    and a.ends_at <= now()
    and (
      a.creator_id = p_user_id
      or exists (
        select 1
        from public.appointment_members am
        where am.appointment_id = a.appointment_id
          and am.user_id = p_user_id
      )
    )
    and not exists (
      select 1
      from public.user_review ur_me
      where ur_me.user_id = p_user_id
        and ur_me.appointment_id = a.appointment_id
        and (
          ur_me.score is not null
          or coalesce(btrim(ur_me.review), '') <> ''
        )
    )
  order by a.ends_at desc, a.appointment_id desc
  offset greatest(p_offset, 0)
  limit greatest(p_limit, 1) + 1;
$$;


ALTER FUNCTION "public"."list_reviewable_appointments_with_stats"("p_user_id" "uuid", "p_offset" integer, "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_reviewable_appointments_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer DEFAULT 6, "p_cursor_ends_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_appointment_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("appointment_id" "uuid", "title" "text", "start_at" timestamp with time zone, "ends_at" timestamp with time zone, "place_id" "uuid", "place_name" "text", "review_avg" numeric, "review_count" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    a.appointment_id,
    a.title,
    a.start_at,
    a.ends_at,
    p.place_id,
    p.name as place_name,
    pr.review_avg,
    pr.review_count
  from public.appointments a
  join public.places p
    on p.place_id = a.place_id
  left join lateral (
    select
      avg(ur.score)::numeric as review_avg,
      count(ur.score)::bigint as review_count
    from public.user_review ur
    where ur.place_id = a.place_id
      and ur.appointment_id is not null
      and ur.score is not null
  ) pr on true
  where a.status <> 'canceled'
    and a.ends_at <= now()
    and (
      a.creator_id = p_user_id
      or exists (
        select 1
        from public.appointment_members am
        where am.appointment_id = a.appointment_id
          and am.user_id = p_user_id
      )
    )
    and not exists (
      select 1
      from public.user_review ur_me
      where ur_me.user_id = p_user_id
        and ur_me.appointment_id = a.appointment_id
        and (
          ur_me.score is not null
          or coalesce(btrim(ur_me.review), '') <> ''
        )
    )
    and (
      p_cursor_ends_at is null
      or (
        a.ends_at,
        a.appointment_id
      ) < (
        p_cursor_ends_at,
        p_cursor_appointment_id
      )
    )
  order by a.ends_at desc, a.appointment_id desc
  limit greatest(coalesce(p_limit, 6), 1) + 1;
$$;


ALTER FUNCTION "public"."list_reviewable_appointments_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer, "p_cursor_ends_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."respond_to_invitation_transactional"("p_user_id" "uuid", "p_invitation_id" "uuid", "p_decision" "text") RETURNS TABLE("ok" boolean, "error_code" "text", "invitation_id" "uuid", "invitation_type" "text", "group_id" "uuid", "appointment_id" "uuid", "status" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_inv public.invitations%rowtype;
  v_appointment_status public.appointment_status;
  v_appointment_ends_at timestamptz;
begin
  if p_user_id is distinct from auth.uid() then
    return query
      select false, 'forbidden', null::uuid, null::text, null::uuid, null::uuid, null::text;
    return;
  end if;

  if p_decision not in ('accepted', 'rejected') then
    return query
      select false, 'invalid-format', null::uuid, null::text, null::uuid, null::uuid, null::text;
    return;
  end if;

  select *
  into v_inv
  from public.invitations i
  where i.invitation_id = p_invitation_id
    and i.invitee_id = p_user_id
  for update;

  if not found then
    return query
      select false, 'invitation-not-found', null::uuid, null::text, null::uuid, null::uuid, null::text;
    return;
  end if;

  if v_inv.status <> 'pending' then
    return query
      select false, 'invitation-already-responded', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
    return;
  end if;

  if p_decision = 'accepted' then
    if v_inv.type = 'group' then
      begin
        insert into public.group_members (
          group_id,
          user_id,
          role
        )
        values (
          v_inv.group_id,
          p_user_id,
          'member'
        );
      exception
        when unique_violation then
          null;
        when others then
          return query
            select false, 'server-error', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
          return;
      end;
    elsif v_inv.type = 'appointment' then
      if v_inv.appointment_id is null then
        return query
          select false, 'invalid-invitation', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
        return;
      end if;

      if not exists (
        select 1
        from public.group_members gm
        where gm.group_id = v_inv.group_id
          and gm.user_id = p_user_id
      ) then
        return query
          select false, 'forbidden-group-membership', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
        return;
      end if;

      select
        a.status,
        a.ends_at
      into
        v_appointment_status,
        v_appointment_ends_at
      from public.appointments a
      where a.appointment_id = v_inv.appointment_id;

      if not found then
        return query
          select false, 'invitation-not-found', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
        return;
      end if;

      if v_appointment_status = 'canceled' then
        return query
          select false, 'forbidden-appointment-canceled', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
        return;
      end if;

      if v_appointment_ends_at <= now() then
        return query
          select false, 'forbidden-appointment-ended', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
        return;
      end if;

      begin
        insert into public.appointment_members (
          appointment_id,
          user_id,
          role
        )
        values (
          v_inv.appointment_id,
          p_user_id,
          'member'
        );
      exception
        when unique_violation then
          null;
        when insufficient_privilege then
          return query
            select false, 'forbidden-join-appointment', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
          return;
        when others then
          return query
            select false, 'server-error', v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
          return;
      end;
    else
      return query
        select false, 'invalid-invitation', v_inv.invitation_id, null::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
      return;
    end if;
  end if;

  update public.invitations i
  set
    status = p_decision::public.invitation_status,
    responded_time = now()
  where i.invitation_id = v_inv.invitation_id
    and i.invitee_id = p_user_id
    and i.status = 'pending'
  returning i.*
  into v_inv;

  if not found then
    return query
      select false, 'invitation-already-responded', null::uuid, null::text, null::uuid, null::uuid, null::text;
    return;
  end if;

  return query
    select true, null::text, v_inv.invitation_id, v_inv.type::text, v_inv.group_id, v_inv.appointment_id, v_inv.status::text;
end;
$$;


ALTER FUNCTION "public"."respond_to_invitation_transactional"("p_user_id" "uuid", "p_invitation_id" "uuid", "p_decision" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_appointment_invitable_users_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_query" "text", "p_limit" integer DEFAULT 6, "p_candidate_limit" integer DEFAULT 20) RETURNS TABLE("ok" boolean, "error_code" "text", "users" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_group_id uuid;
  v_status public.appointment_status;
  v_ends_at timestamptz;
  v_query text;
  v_users jsonb;
begin
  if p_inviter_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::jsonb;
    return;
  end if;

  if p_inviter_id is null or p_appointment_id is null or p_query is null then
    return query select false, 'invalid-format', null::jsonb;
    return;
  end if;

  v_query := btrim(p_query);
  if v_query = '' then
    return query select false, 'invalid-format', null::jsonb;
    return;
  end if;

  select
    a.group_id,
    a.status,
    a.ends_at
  into
    v_group_id,
    v_status,
    v_ends_at
  from public.appointments a
  where a.appointment_id = p_appointment_id;

  if not found then
    return query select false, 'forbidden', null::jsonb;
    return;
  end if;

  if v_status = 'canceled' then
    return query select false, 'forbidden-appointment-canceled', null::jsonb;
    return;
  end if;

  if v_ends_at <= now() then
    return query select false, 'forbidden-appointment-ended', null::jsonb;
    return;
  end if;

  if not exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_inviter_id
  ) then
    return query select false, 'forbidden-not-member', null::jsonb;
    return;
  end if;

  with candidates as (
    select
      u.user_id,
      u.name,
      u.nickname
    from public.users u
    join public.group_members gm
      on gm.group_id = v_group_id
      and gm.user_id = u.user_id
    where u.user_id <> p_inviter_id
      and (
        u.nickname ilike '%' || v_query || '%'
        or u.name ilike '%' || v_query || '%'
      )
    limit greatest(coalesce(p_candidate_limit, 20), 1)
  ),
  filtered as (
    select
      c.user_id,
      c.name,
      c.nickname
    from candidates c
    left join public.appointment_members am
      on am.appointment_id = p_appointment_id
      and am.user_id = c.user_id
    where am.user_id is null
    limit greatest(coalesce(p_limit, 6), 1)
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'user_id', f.user_id,
          'name', f.name,
          'nickname', f.nickname
        )
      ),
      '[]'::jsonb
    )
  into v_users
  from filtered f;

  return query select true, null::text, v_users;
end;
$$;


ALTER FUNCTION "public"."search_appointment_invitable_users_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_query" "text", "p_limit" integer, "p_candidate_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_appointments_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer DEFAULT 10, "p_cursor_start_at" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_cursor_appointment_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("appointment_id" "uuid", "title" "text", "start_at" timestamp with time zone, "ends_at" timestamp with time zone, "host_name" "text", "host_nickname" "text", "host_profile_image" "text", "member_count" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    a.appointment_id,
    a.title,
    a.start_at,
    a.ends_at,
    u.name as host_name,
    u.nickname as host_nickname,
    u.profile_image as host_profile_image,
    (
      select count(*)::bigint
      from public.appointment_members am_count
      where am_count.appointment_id = a.appointment_id
    ) as member_count
  from public.appointments a
  left join public.users u on u.user_id = a.creator_id
  where a.title ilike '%' || p_query || '%'
    and exists (
      select 1
      from public.group_members gm_access
      where gm_access.group_id = a.group_id
        and gm_access.user_id = p_user_id
    )
    and (
      p_cursor_start_at is null
      or a.start_at < p_cursor_start_at
      or (
        a.start_at = p_cursor_start_at
        and a.appointment_id < p_cursor_appointment_id
      )
    )
  order by a.start_at desc, a.appointment_id desc
  limit greatest(p_limit, 1) + 1;
$$;


ALTER FUNCTION "public"."search_appointments_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer, "p_cursor_start_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_group_invitable_users_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_query" "text", "p_limit" integer DEFAULT 6, "p_candidate_limit" integer DEFAULT 20) RETURNS TABLE("ok" boolean, "error_code" "text", "users" "jsonb", "pending_invitee_ids" "uuid"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_query text;
  v_result_users jsonb;
  v_pending_invitee_ids uuid[];
begin
  if p_inviter_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::jsonb, null::uuid[];
    return;
  end if;

  if p_inviter_id is null or p_group_id is null or p_query is null then
    return query select false, 'invalid-format', null::jsonb, null::uuid[];
    return;
  end if;

  v_query := btrim(p_query);
  if v_query = '' then
    return query select false, 'invalid-format', null::jsonb, null::uuid[];
    return;
  end if;

  if not exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_inviter_id
  ) then
    return query select false, 'forbidden', null::jsonb, null::uuid[];
    return;
  end if;

  with candidates as (
    select
      u.user_id,
      u.name,
      u.nickname
    from public.users u
    where u.user_id <> p_inviter_id
      and (
        u.nickname ilike '%' || v_query || '%'
        or u.name ilike '%' || v_query || '%'
      )
    limit greatest(coalesce(p_candidate_limit, 20), 1)
  ),
  filtered as (
    select
      c.user_id,
      c.name,
      c.nickname,
      exists (
        select 1
        from public.invitations i
        where i.group_id = p_group_id
          and i.type = 'group'
          and i.status = 'pending'
          and i.invitee_id = c.user_id
      ) as is_pending
    from candidates c
    left join public.group_members gm
      on gm.group_id = p_group_id
      and gm.user_id = c.user_id
    where gm.user_id is null
    limit greatest(coalesce(p_limit, 6), 1)
  )
  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'user_id', f.user_id,
          'name', f.name,
          'nickname', f.nickname
        )
      ),
      '[]'::jsonb
    ),
    coalesce(
      array_agg(f.user_id) filter (where f.is_pending),
      '{}'::uuid[]
    )
  into
    v_result_users,
    v_pending_invitee_ids
  from filtered f;

  return query
    select true, null::text, v_result_users, v_pending_invitee_ids;
end;
$$;


ALTER FUNCTION "public"."search_group_invitable_users_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_query" "text", "p_limit" integer, "p_candidate_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_groups_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer DEFAULT 10, "p_cursor_name" "text" DEFAULT NULL::"text", "p_cursor_group_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("group_id" "uuid", "group_name" "text", "owner_name" "text", "owner_nickname" "text", "owner_profile_image" "text", "member_count" bigint, "is_member" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    g.group_id,
    g.name as group_name,
    u.name as owner_name,
    u.nickname as owner_nickname,
    u.profile_image as owner_profile_image,
    (
      select count(*)::bigint
      from public.group_members gm_count
      where gm_count.group_id = g.group_id
    ) as member_count,
    exists (
      select 1
      from public.group_members gm_me
      where gm_me.group_id = g.group_id
        and gm_me.user_id = p_user_id
    ) as is_member
  from public.groups g
  left join public.users u on u.user_id = g.owner_id
  where g.name ilike '%' || p_query || '%'
    and (
      p_cursor_name is null
      or g.name > p_cursor_name
      or (g.name = p_cursor_name and g.group_id > p_cursor_group_id)
    )
  order by g.name asc, g.group_id asc
  limit greatest(p_limit, 1) + 1;
$$;


ALTER FUNCTION "public"."search_groups_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer, "p_cursor_name" "text", "p_cursor_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_appointment_invitation_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_invitee_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_app public.appointments%rowtype;
  v_exists boolean;
begin
  if p_inviter_id is distinct from auth.uid() then
    return query select false, 'forbidden';
    return;
  end if;

  if p_inviter_id is null or p_appointment_id is null or p_invitee_id is null then
    return query select false, 'invalid-format';
    return;
  end if;

  if p_inviter_id = p_invitee_id then
    return query select false, 'invalid-format';
    return;
  end if;

  select *
  into v_app
  from public.appointments a
  where a.appointment_id = p_appointment_id
  for update;

  if not found then
    return query select false, 'appointment-not-found';
    return;
  end if;

  if v_app.status = 'canceled' then
    return query select false, 'forbidden-appointment-canceled';
    return;
  end if;

  if v_app.ends_at <= now() then
    return query select false, 'forbidden-appointment-ended';
    return;
  end if;

  select exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_inviter_id
  )
  into v_exists;

  if not v_exists then
    return query select false, 'forbidden-not-appointment-member';
    return;
  end if;

  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = v_app.group_id
      and gm.user_id = p_invitee_id
  )
  into v_exists;

  if not v_exists then
    return query select false, 'forbidden-invitee-not-group-member';
    return;
  end if;

  select exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_invitee_id
  )
  into v_exists;

  if v_exists then
    return query select false, 'already-member';
    return;
  end if;

  select exists (
    select 1
    from public.invitations i
    where i.appointment_id = p_appointment_id
      and i.invitee_id = p_invitee_id
      and i.type = 'appointment'
      and i.status = 'pending'
  )
  into v_exists;

  if v_exists then
    return query select false, 'invite-already-sent';
    return;
  end if;

  begin
    insert into public.invitations (
      group_id,
      appointment_id,
      inviter_id,
      invitee_id,
      type,
      status
    )
    values (
      v_app.group_id,
      p_appointment_id,
      p_inviter_id,
      p_invitee_id,
      'appointment',
      'pending'
    );
  exception
    when unique_violation then
      return query select false, 'invite-already-sent';
      return;
    when insufficient_privilege then
      return query select false, 'forbidden';
      return;
    when others then
      return query select false, 'server-error';
      return;
  end;

  return query select true, null::text;
end;
$$;


ALTER FUNCTION "public"."send_appointment_invitation_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_invitee_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_group_invitation_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_invitee_id" "uuid") RETURNS TABLE("ok" boolean, "error_code" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_exists boolean;
begin
  if p_inviter_id is distinct from auth.uid() then
    return query select false, 'forbidden';
    return;
  end if;

  if p_inviter_id is null or p_group_id is null or p_invitee_id is null then
    return query select false, 'invalid-format';
    return;
  end if;

  if p_inviter_id = p_invitee_id then
    return query select false, 'invalid-format';
    return;
  end if;

  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_inviter_id
  )
  into v_exists;

  if not v_exists then
    return query select false, 'forbidden';
    return;
  end if;

  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_invitee_id
  )
  into v_exists;

  if v_exists then
    return query select false, 'already-member';
    return;
  end if;

  select exists (
    select 1
    from public.invitations i
    where i.group_id = p_group_id
      and i.invitee_id = p_invitee_id
      and i.type = 'group'
      and i.status = 'pending'
  )
  into v_exists;

  if v_exists then
    return query select false, 'invite-already-sent';
    return;
  end if;

  begin
    insert into public.invitations (
      group_id,
      inviter_id,
      invitee_id,
      type,
      status
    )
    values (
      p_group_id,
      p_inviter_id,
      p_invitee_id,
      'group',
      'pending'
    );
  exception
    when unique_violation then
      return query select false, 'invite-already-sent';
      return;
    when insufficient_privilege then
      return query select false, 'forbidden';
      return;
    when others then
      return query select false, 'server-error';
      return;
  end;

  return query select true, null::text;
end;
$$;


ALTER FUNCTION "public"."send_group_invitation_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_invitee_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_profile_image_transactional"("p_user_id" "uuid", "p_profile_image" "text") RETURNS TABLE("ok" boolean, "error_code" "text", "previous_profile_image" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_previous_profile_image text;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::text;
    return;
  end if;

  if p_user_id is null
    or p_profile_image is null
    or btrim(p_profile_image) = '' then
    return query select false, 'invalid-format', null::text;
    return;
  end if;

  select u.profile_image
  into v_previous_profile_image
  from public.users u
  where u.user_id = p_user_id
  for update;

  if not found then
    return query select false, 'not-found', null::text;
    return;
  end if;

  begin
    update public.users u
    set profile_image = p_profile_image
    where u.user_id = p_user_id;
  exception
    when insufficient_privilege then
      return query select false, 'forbidden', null::text;
      return;
    when others then
      return query select false, 'server-error', null::text;
      return;
  end;

  return query select true, null::text, v_previous_profile_image;
end;
$$;


ALTER FUNCTION "public"."set_user_profile_image_transactional"("p_user_id" "uuid", "p_profile_image" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_place_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_score" integer, "p_content" "text", "p_edited_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("ok" boolean, "error_code" "text", "appointment_id" "uuid", "place_id" "uuid", "mode" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_appointment public.appointments%rowtype;
  v_review public.user_review%rowtype;
  v_mode text;
  v_edited_at timestamptz;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid, null::uuid, null::text;
    return;
  end if;

  if p_user_id is null
    or p_appointment_id is null
    or p_score is null
    or p_content is null then
    return query select false, 'invalid-format', null::uuid, null::uuid, null::text;
    return;
  end if;

  select *
  into v_appointment
  from public.appointments a
  where a.appointment_id = p_appointment_id;

  if not found then
    return query select false, 'forbidden-not-found', null::uuid, null::uuid, null::text;
    return;
  end if;

  if v_appointment.status = 'canceled' or v_appointment.ends_at > now() then
    return query select false, 'forbidden-not-ended', null::uuid, null::uuid, null::text;
    return;
  end if;

  if v_appointment.creator_id <> p_user_id and not exists (
    select 1
    from public.appointment_members am
    where am.appointment_id = p_appointment_id
      and am.user_id = p_user_id
  ) then
    return query select false, 'forbidden-no-permission', null::uuid, null::uuid, null::text;
    return;
  end if;

  if v_appointment.place_id is null then
    return query select false, 'invalid-reference', null::uuid, null::uuid, null::text;
    return;
  end if;

  v_edited_at := coalesce(p_edited_at, now());

  select *
  into v_review
  from public.user_review ur
  where ur.appointment_id = p_appointment_id
    and ur.user_id = p_user_id
  limit 1
  for update;

  if found then
    if v_review.score is not null
      or (v_review.review is not null and btrim(v_review.review) <> '') then
      v_mode := 'updated';
    else
      v_mode := 'created';
    end if;

    begin
      update public.user_review ur
      set
        score = p_score,
        review = p_content,
        place_id = v_appointment.place_id,
        edited_at = v_edited_at
      where ur.review_id = v_review.review_id;
    exception
      when foreign_key_violation or not_null_violation then
        return query select false, 'invalid-reference', null::uuid, null::uuid, null::text;
        return;
      when insufficient_privilege then
        return query select false, 'forbidden', null::uuid, null::uuid, null::text;
        return;
      when others then
        return query select false, 'server-error', null::uuid, null::uuid, null::text;
        return;
    end;
  else
    v_mode := 'created';
    begin
      insert into public.user_review (
        user_id,
        appointment_id,
        place_id,
        score,
        review,
        edited_at
      )
      values (
        p_user_id,
        p_appointment_id,
        v_appointment.place_id,
        p_score,
        p_content,
        v_edited_at
      );
    exception
      when unique_violation then
        return query select false, 'already-reviewed', null::uuid, null::uuid, null::text;
        return;
      when foreign_key_violation or not_null_violation then
        return query select false, 'invalid-reference', null::uuid, null::uuid, null::text;
        return;
      when insufficient_privilege then
        return query select false, 'forbidden', null::uuid, null::uuid, null::text;
        return;
      when others then
        return query select false, 'server-error', null::uuid, null::uuid, null::text;
        return;
    end;
  end if;

  return query
    select true, null::text, p_appointment_id, v_appointment.place_id, v_mode;
end;
$$;


ALTER FUNCTION "public"."submit_place_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_score" integer, "p_content" "text", "p_edited_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_appointment_status_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_status" "text") RETURNS TABLE("ok" boolean, "error_code" "text", "status" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_appointment public.appointments%rowtype;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::text;
    return;
  end if;

  if p_user_id is null
    or p_appointment_id is null
    or p_status is null then
    return query select false, 'invalid-format', null::text;
    return;
  end if;

  if p_status not in ('pending', 'canceled') then
    return query select false, 'invalid-format', null::text;
    return;
  end if;

  select *
  into v_appointment
  from public.appointments a
  where a.appointment_id = p_appointment_id
  for update;

  if not found then
    return query select false, 'not-found', null::text;
    return;
  end if;

  if v_appointment.creator_id <> p_user_id then
    return query select false, 'forbidden-not-owner', null::text;
    return;
  end if;

  if v_appointment.ends_at <= now() then
    return query select false, 'forbidden-ended', null::text;
    return;
  end if;

  begin
    update public.appointments a
    set status = p_status::public.appointment_status
    where a.appointment_id = p_appointment_id;
  exception
    when invalid_text_representation then
      return query select false, 'invalid-format', null::text;
      return;
    when insufficient_privilege then
      return query select false, 'forbidden', null::text;
      return;
    when others then
      return query select false, 'server-error', null::text;
      return;
  end;

  return query select true, null::text, p_status;
end;
$$;


ALTER FUNCTION "public"."update_appointment_status_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_id" "uuid" DEFAULT NULL::"uuid", "p_place_kakao_id" "text" DEFAULT NULL::"text", "p_place_name" "text" DEFAULT NULL::"text", "p_place_address" "text" DEFAULT NULL::"text", "p_place_category" "text" DEFAULT NULL::"text", "p_place_latitude" double precision DEFAULT NULL::double precision, "p_place_longitude" double precision DEFAULT NULL::double precision) RETURNS TABLE("ok" boolean, "error_code" "text", "appointment_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_creator_id uuid;
  v_resolved_place_id uuid;
begin
  if p_user_id is distinct from auth.uid() then
    return query select false, 'forbidden', null::uuid;
    return;
  end if;

  if p_user_id is null
    or p_appointment_id is null
    or p_title is null
    or p_start_at is null
    or p_ends_at is null then
    return query select false, 'invalid-format', null::uuid;
    return;
  end if;

  select a.creator_id
  into v_creator_id
  from public.appointments a
  where a.appointment_id = p_appointment_id;

  if not found then
    return query select false, 'appointment-not-found', null::uuid;
    return;
  end if;

  if v_creator_id <> p_user_id then
    return query select false, 'forbidden', null::uuid;
    return;
  end if;

  v_resolved_place_id := p_place_id;

  if v_resolved_place_id is null then
    if p_place_kakao_id is null
      or p_place_name is null
      or p_place_address is null
      or p_place_latitude is null
      or p_place_longitude is null then
      return query select false, 'missing-place', null::uuid;
      return;
    end if;

    begin
      insert into public.places (
        kakao_id,
        name,
        address,
        category,
        latitude,
        longitude
      )
      values (
        p_place_kakao_id,
        p_place_name,
        p_place_address,
        coalesce(p_place_category, ''),
        p_place_latitude,
        p_place_longitude
      )
      on conflict (kakao_id) do update
      set
        name = excluded.name,
        address = excluded.address,
        category = excluded.category,
        latitude = excluded.latitude,
        longitude = excluded.longitude
      returning places.place_id
      into v_resolved_place_id;
    exception
      when others then
        return query select false, 'missing-place', null::uuid;
        return;
    end;
  end if;

  begin
    update public.appointments a
    set
      title = p_title,
      start_at = p_start_at,
      ends_at = p_ends_at,
      place_id = v_resolved_place_id
    where a.appointment_id = p_appointment_id;
  exception
    when foreign_key_violation then
      return query select false, 'missing-place', null::uuid;
      return;
    when others then
      return query select false, 'server-error', null::uuid;
      return;
  end;

  return query select true, null::text, p_appointment_id;
end;
$$;


ALTER FUNCTION "public"."update_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_id" "uuid", "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text", "p_place_latitude" double precision, "p_place_longitude" double precision) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointment_comments" (
    "comment_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "appointment_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "edited_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."appointment_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointment_members" (
    "appointment_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."appointment_member_role" DEFAULT 'member'::"public"."appointment_member_role" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."appointment_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "appointment_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "group_id" "uuid" NOT NULL,
    "place_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "start_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone NOT NULL,
    "status" "public"."appointment_status" DEFAULT 'pending'::"public"."appointment_status" NOT NULL,
    "is_ended" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "appointments_time_chk" CHECK (("ends_at" > "start_at"))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."group_member_role" DEFAULT 'member'::"public"."group_member_role" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groups" (
    "group_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "invitation_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "inviter_id" "uuid" NOT NULL,
    "invitee_id" "uuid" NOT NULL,
    "type" "public"."invitation_type" NOT NULL,
    "status" "public"."invitation_status" DEFAULT 'pending'::"public"."invitation_status" NOT NULL,
    "created_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "responded_time" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "invitations_type_chk" CHECK (((("type" = 'group'::"public"."invitation_type") AND ("appointment_id" IS NULL)) OR (("type" = 'appointment'::"public"."invitation_type") AND ("appointment_id" IS NOT NULL))))
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "notification_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "target_type" "public"."notification_target_type" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "link_url" "text",
    "created_time" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."places" (
    "place_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "kakao_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" DEFAULT ''::"text" NOT NULL,
    "address" "text" DEFAULT ''::"text" NOT NULL,
    "longitude" numeric(10,7) NOT NULL,
    "latitude" numeric(10,7) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."places" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_notifications" (
    "user_notification_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_id" "uuid" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "read_at" timestamp with time zone,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_review" (
    "user_id" "uuid" NOT NULL,
    "place_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "edited_at" timestamp with time zone,
    "review" "text",
    "score" integer,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "appointment_id" "uuid",
    "review_id" "uuid" DEFAULT "extensions"."gen_random_uuid"() NOT NULL,
    CONSTRAINT "user_places_score_chk" CHECK ((("score" IS NULL) OR (("score" >= 1) AND ("score" <= 5))))
);


ALTER TABLE "public"."user_review" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "user_id" "uuid" NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "nickname" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "profile_image" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointment_comments"
    ADD CONSTRAINT "appointment_comments_pkey" PRIMARY KEY ("comment_id");



ALTER TABLE ONLY "public"."appointment_members"
    ADD CONSTRAINT "appointment_members_pkey" PRIMARY KEY ("appointment_id", "user_id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id", "user_id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("group_id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("invitation_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id");



ALTER TABLE ONLY "public"."places"
    ADD CONSTRAINT "places_pkey" PRIMARY KEY ("place_id");



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("user_notification_id");



ALTER TABLE ONLY "public"."user_review"
    ADD CONSTRAINT "user_review_pkey" PRIMARY KEY ("review_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "appointment_comments_appointment_created_id_active_idx" ON "public"."appointment_comments" USING "btree" ("appointment_id", "created_at" DESC, "comment_id" DESC) WHERE (("is_deleted" = false) AND ("deleted_at" IS NULL));



CREATE INDEX "appointment_comments_appt_idx" ON "public"."appointment_comments" USING "btree" ("appointment_id", "created_at");



CREATE INDEX "appointment_comments_user_created_id_active_idx" ON "public"."appointment_comments" USING "btree" ("user_id", "created_at" DESC, "comment_id" DESC) WHERE (("is_deleted" = false) AND ("deleted_at" IS NULL));



CREATE INDEX "appointment_members_user_appointment_idx" ON "public"."appointment_members" USING "btree" ("user_id", "appointment_id");



CREATE INDEX "appointment_members_user_idx" ON "public"."appointment_members" USING "btree" ("user_id");



CREATE INDEX "appointments_ended_partial_idx" ON "public"."appointments" USING "btree" ("ends_at") WHERE ("is_ended" = false);



CREATE INDEX "appointments_group_idx" ON "public"."appointments" USING "btree" ("group_id");



CREATE INDEX "appointments_group_start_at_id_idx" ON "public"."appointments" USING "btree" ("group_id", "start_at" DESC, "appointment_id" DESC);



CREATE INDEX "appointments_pending_ends_at_id_idx" ON "public"."appointments" USING "btree" ("ends_at" DESC, "appointment_id" DESC) WHERE ("status" = 'pending'::"public"."appointment_status");



CREATE INDEX "appointments_place_idx" ON "public"."appointments" USING "btree" ("place_id");



CREATE INDEX "appointments_time_idx" ON "public"."appointments" USING "btree" ("start_at", "ends_at");



CREATE INDEX "group_members_user_idx" ON "public"."group_members" USING "btree" ("user_id");



CREATE INDEX "groups_owner_idx" ON "public"."groups" USING "btree" ("owner_id");



CREATE INDEX "invitations_appointment_idx" ON "public"."invitations" USING "btree" ("appointment_id");



CREATE INDEX "invitations_group_idx" ON "public"."invitations" USING "btree" ("group_id");



CREATE INDEX "invitations_invitee_created_id_active_idx" ON "public"."invitations" USING "btree" ("invitee_id", "created_time" DESC, "invitation_id" DESC) WHERE ("status" = ANY (ARRAY['pending'::"public"."invitation_status", 'accepted'::"public"."invitation_status", 'rejected'::"public"."invitation_status"]));



CREATE INDEX "invitations_invitee_idx" ON "public"."invitations" USING "btree" ("invitee_id", "status");



CREATE UNIQUE INDEX "invitations_unique_pending_appointment" ON "public"."invitations" USING "btree" ("appointment_id", "inviter_id", "invitee_id", "type") WHERE (("status" = 'pending'::"public"."invitation_status") AND ("type" = 'appointment'::"public"."invitation_type"));



CREATE UNIQUE INDEX "invitations_unique_pending_group" ON "public"."invitations" USING "btree" ("group_id", "inviter_id", "invitee_id", "type") WHERE (("status" = 'pending'::"public"."invitation_status") AND ("type" = 'group'::"public"."invitation_type"));



CREATE INDEX "notifications_target_idx" ON "public"."notifications" USING "btree" ("target_type", "target_id");



CREATE UNIQUE INDEX "places_kakao_id_uk" ON "public"."places" USING "btree" ("kakao_id");



CREATE INDEX "user_notifications_user_idx" ON "public"."user_notifications" USING "btree" ("user_id", "is_read", "is_deleted");



CREATE INDEX "user_review_appointment_id_idx" ON "public"."user_review" USING "btree" ("appointment_id");



CREATE INDEX "user_review_place_id_idx" ON "public"."user_review" USING "btree" ("place_id");



CREATE INDEX "user_review_place_updated_review_idx" ON "public"."user_review" USING "btree" ("place_id", "updated_at" DESC, "review_id" DESC) WHERE (("appointment_id" IS NOT NULL) AND (("score" IS NOT NULL) OR ("review" IS NOT NULL)));



CREATE UNIQUE INDEX "user_review_user_id_appointment_id_uidx" ON "public"."user_review" USING "btree" ("user_id", "appointment_id") WHERE ("appointment_id" IS NOT NULL);



CREATE INDEX "user_review_user_updated_review_idx" ON "public"."user_review" USING "btree" ("user_id", "updated_at" DESC, "review_id" DESC) WHERE (("appointment_id" IS NOT NULL) AND (("score" IS NOT NULL) OR ("review" IS NOT NULL)));



CREATE INDEX "users_email_idx" ON "public"."users" USING "btree" ("email");



CREATE INDEX "users_nickname_idx" ON "public"."users" USING "btree" ("nickname");



CREATE OR REPLACE TRIGGER "set_appointment_comments_updated_at" BEFORE UPDATE ON "public"."appointment_comments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_appointment_members_updated_at" BEFORE UPDATE ON "public"."appointment_members" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_appointments_updated_at" BEFORE UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_group_members_updated_at" BEFORE UPDATE ON "public"."group_members" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_groups_updated_at" BEFORE UPDATE ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_invitations_updated_at" BEFORE UPDATE ON "public"."invitations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_places_updated_at" BEFORE UPDATE ON "public"."places" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_user_places_updated_at" BEFORE UPDATE ON "public"."user_review" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."appointment_comments"
    ADD CONSTRAINT "appointment_comments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("appointment_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_comments"
    ADD CONSTRAINT "appointment_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_members"
    ADD CONSTRAINT "appointment_members_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("appointment_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_members"
    ADD CONSTRAINT "appointment_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("group_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("place_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("group_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("appointment_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("group_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("notification_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_review"
    ADD CONSTRAINT "user_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."places"("place_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_review"
    ADD CONSTRAINT "user_places_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_review"
    ADD CONSTRAINT "user_review_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("appointment_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."appointment_comments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "appointment_comments_delete_self" ON "public"."appointment_comments" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "appointment_comments_insert_group_member_self" ON "public"."appointment_comments" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."appointments" "a"
     JOIN "public"."group_members" "gm" ON (("gm"."group_id" = "a"."group_id")))
  WHERE (("a"."appointment_id" = "appointment_comments"."appointment_id") AND ("gm"."user_id" = "auth"."uid"()))))));



CREATE POLICY "appointment_comments_select_group_member" ON "public"."appointment_comments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."appointments" "a"
     JOIN "public"."group_members" "gm" ON (("gm"."group_id" = "a"."group_id")))
  WHERE (("a"."appointment_id" = "appointment_comments"."appointment_id") AND ("gm"."user_id" = "auth"."uid"())))));



CREATE POLICY "appointment_comments_update_self" ON "public"."appointment_comments" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."appointment_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "appointment_members_delete_self" ON "public"."appointment_members" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "appointment_members_insert_self" ON "public"."appointment_members" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."appointments" "a"
     JOIN "public"."group_members" "gm" ON (("gm"."group_id" = "a"."group_id")))
  WHERE (("a"."appointment_id" = "appointment_members"."appointment_id") AND ("gm"."user_id" = "auth"."uid"()))))));



CREATE POLICY "appointment_members_select_group_member" ON "public"."appointment_members" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."appointments" "a"
     JOIN "public"."group_members" "gm" ON (("gm"."group_id" = "a"."group_id")))
  WHERE (("a"."appointment_id" = "appointment_members"."appointment_id") AND ("gm"."user_id" = "auth"."uid"())))));



CREATE POLICY "appointment_members_select_self" ON "public"."appointment_members" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "appointment_members_update_self" ON "public"."appointment_members" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "appointments_delete_creator" ON "public"."appointments" FOR DELETE TO "authenticated" USING (("creator_id" = "auth"."uid"()));



CREATE POLICY "appointments_insert_group_member" ON "public"."appointments" FOR INSERT TO "authenticated" WITH CHECK ((("creator_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."group_members" "gm"
  WHERE (("gm"."group_id" = "appointments"."group_id") AND ("gm"."user_id" = "auth"."uid"()))))));



CREATE POLICY "appointments_select_group_member" ON "public"."appointments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."group_members" "gm"
  WHERE (("gm"."group_id" = "appointments"."group_id") AND ("gm"."user_id" = "auth"."uid"())))));



CREATE POLICY "appointments_update_creator" ON "public"."appointments" FOR UPDATE TO "authenticated" USING (("creator_id" = "auth"."uid"())) WITH CHECK (("creator_id" = "auth"."uid"()));



ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "group_members_delete_self" ON "public"."group_members" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) AND ("role" <> 'owner'::"public"."group_member_role")));



CREATE POLICY "group_members_insert_self_or_owner" ON "public"."group_members" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."groups" "g"
  WHERE (("g"."group_id" = "group_members"."group_id") AND ("g"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "group_members_select_self" ON "public"."group_members" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "groups_insert_owner" ON "public"."groups" FOR INSERT TO "authenticated" WITH CHECK (("owner_id" = "auth"."uid"()));



CREATE POLICY "groups_select_authenticated" ON "public"."groups" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "invitations_insert_group_member" ON "public"."invitations" FOR INSERT TO "authenticated" WITH CHECK ((("inviter_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."group_members" "gm"
  WHERE (("gm"."group_id" = "invitations"."group_id") AND ("gm"."user_id" = "auth"."uid"()))))));



CREATE POLICY "invitations_select_group_member" ON "public"."invitations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."group_members" "gm"
  WHERE (("gm"."group_id" = "invitations"."group_id") AND ("gm"."user_id" = "auth"."uid"())))));



CREATE POLICY "invitations_select_invitee_self" ON "public"."invitations" FOR SELECT TO "authenticated" USING (("invitee_id" = "auth"."uid"()));



CREATE POLICY "invitations_update_invitee_self" ON "public"."invitations" FOR UPDATE TO "authenticated" USING (("invitee_id" = "auth"."uid"())) WITH CHECK (("invitee_id" = "auth"."uid"()));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."places" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "places_delete_authenticated" ON "public"."places" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "places_insert_authenticated" ON "public"."places" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "places_select_authenticated" ON "public"."places" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "places_update_authenticated" ON "public"."places" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."user_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_review" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_review_delete_self" ON "public"."user_review" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "user_review_insert_self_for_ended_appointment" ON "public"."user_review" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND ("appointment_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."appointments" "a"
  WHERE (("a"."appointment_id" = "user_review"."appointment_id") AND ("a"."status" <> 'canceled'::"public"."appointment_status") AND ("a"."ends_at" <= "now"()) AND (("a"."creator_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."appointment_members" "am"
          WHERE (("am"."appointment_id" = "a"."appointment_id") AND ("am"."user_id" = "auth"."uid"()))))))))));



CREATE POLICY "user_review_select_authenticated" ON "public"."user_review" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "user_review_update_self_for_ended_appointment" ON "public"."user_review" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK ((("user_id" = "auth"."uid"()) AND ("appointment_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."appointments" "a"
  WHERE (("a"."appointment_id" = "user_review"."appointment_id") AND ("a"."status" <> 'canceled'::"public"."appointment_status") AND ("a"."ends_at" <= "now"()) AND (("a"."creator_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."appointment_members" "am"
          WHERE (("am"."appointment_id" = "a"."appointment_id") AND ("am"."user_id" = "auth"."uid"()))))))))));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_select_authenticated" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "users_update_self" ON "public"."users" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





























































































































































































GRANT ALL ON FUNCTION "public"."check_email_exists"("p_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_email_exists"("p_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_email_exists"("p_email" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."clear_user_profile_image_transactional"("p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."clear_user_profile_image_transactional"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."clear_user_profile_image_transactional"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."clear_user_profile_image_transactional"("p_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_appointment_with_owner_member"("p_user_id" "uuid", "p_group_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text", "p_place_latitude" double precision, "p_place_longitude" double precision) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_appointment_with_owner_member"("p_user_id" "uuid", "p_group_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text", "p_place_latitude" double precision, "p_place_longitude" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."create_appointment_with_owner_member"("p_user_id" "uuid", "p_group_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text", "p_place_latitude" double precision, "p_place_longitude" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_appointment_with_owner_member"("p_user_id" "uuid", "p_group_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text", "p_place_latitude" double precision, "p_place_longitude" double precision) TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_group_transactional"("p_owner_id" "uuid", "p_group_name" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_group_transactional"("p_owner_id" "uuid", "p_group_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_group_transactional"("p_owner_id" "uuid", "p_group_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_group_transactional"("p_owner_id" "uuid", "p_group_name" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."delete_my_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_edited_at" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_my_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_edited_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_my_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_edited_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_my_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_edited_at" timestamp with time zone) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_appointment_comments_with_cursor"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_limit" integer, "p_cursor_created_at" timestamp with time zone, "p_cursor_comment_id" "uuid", "p_include_count" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_appointment_comments_with_cursor"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_limit" integer, "p_cursor_created_at" timestamp with time zone, "p_cursor_comment_id" "uuid", "p_include_count" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_appointment_comments_with_cursor"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_limit" integer, "p_cursor_created_at" timestamp with time zone, "p_cursor_comment_id" "uuid", "p_include_count" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_appointment_comments_with_cursor"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_limit" integer, "p_cursor_created_at" timestamp with time zone, "p_cursor_comment_id" "uuid", "p_include_count" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_appointment_detail_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_appointment_detail_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_appointment_detail_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_appointment_detail_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_appointment_invitation_state_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_appointment_invitation_state_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_appointment_invitation_state_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_appointment_invitation_state_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_appointment_members_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_appointment_members_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_appointment_members_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_appointment_members_with_count"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_appointment_review_target_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_appointment_review_target_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_appointment_review_target_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_appointment_review_target_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_group_members_with_count"("p_user_id" "uuid", "p_group_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_group_members_with_count"("p_user_id" "uuid", "p_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_group_members_with_count"("p_user_id" "uuid", "p_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_group_members_with_count"("p_user_id" "uuid", "p_group_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_place_detail_with_stats"("p_place_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_place_detail_with_stats"("p_place_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_place_detail_with_stats"("p_place_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_place_detail_with_stats"("p_place_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."join_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."join_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."join_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."join_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."join_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."join_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."join_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."join_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."leave_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."leave_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."leave_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."leave_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."leave_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."leave_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."leave_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."leave_group_transactional"("p_user_id" "uuid", "p_group_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_appointment_history_with_stats"("p_user_id" "uuid", "p_offset" integer, "p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_appointment_history_with_stats"("p_user_id" "uuid", "p_offset" integer, "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."list_appointment_history_with_stats"("p_user_id" "uuid", "p_offset" integer, "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_appointment_history_with_stats"("p_user_id" "uuid", "p_offset" integer, "p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_appointment_history_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer, "p_cursor_ends_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_appointment_history_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer, "p_cursor_ends_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_appointment_history_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer, "p_cursor_ends_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_appointment_history_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer, "p_cursor_ends_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_appointments_with_stats"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text", "p_type" "text", "p_cursor" timestamp with time zone, "p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_appointments_with_stats"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text", "p_type" "text", "p_cursor" timestamp with time zone, "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."list_appointments_with_stats"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text", "p_type" "text", "p_cursor" timestamp with time zone, "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_appointments_with_stats"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text", "p_type" "text", "p_cursor" timestamp with time zone, "p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_appointments_with_stats_cursor"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text", "p_type" "text", "p_cursor_start_at" timestamp with time zone, "p_cursor_appointment_id" "uuid", "p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_appointments_with_stats_cursor"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text", "p_type" "text", "p_cursor_start_at" timestamp with time zone, "p_cursor_appointment_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."list_appointments_with_stats_cursor"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text", "p_type" "text", "p_cursor_start_at" timestamp with time zone, "p_cursor_appointment_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_appointments_with_stats_cursor"("p_user_id" "uuid", "p_group_id" "uuid", "p_period" "text", "p_type" "text", "p_cursor_start_at" timestamp with time zone, "p_cursor_appointment_id" "uuid", "p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_my_comments_with_cursor"("p_limit" integer, "p_cursor_created_at" timestamp with time zone, "p_cursor_comment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_my_comments_with_cursor"("p_limit" integer, "p_cursor_created_at" timestamp with time zone, "p_cursor_comment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_my_comments_with_cursor"("p_limit" integer, "p_cursor_created_at" timestamp with time zone, "p_cursor_comment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_my_comments_with_cursor"("p_limit" integer, "p_cursor_created_at" timestamp with time zone, "p_cursor_comment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_my_groups_with_stats"("p_user_id" "uuid", "p_limit" integer, "p_cursor_joined_at" timestamp with time zone, "p_cursor_group_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_my_groups_with_stats"("p_user_id" "uuid", "p_limit" integer, "p_cursor_joined_at" timestamp with time zone, "p_cursor_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_my_groups_with_stats"("p_user_id" "uuid", "p_limit" integer, "p_cursor_joined_at" timestamp with time zone, "p_cursor_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_my_groups_with_stats"("p_user_id" "uuid", "p_limit" integer, "p_cursor_joined_at" timestamp with time zone, "p_cursor_group_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_my_reviews_with_cursor"("p_limit" integer, "p_cursor_updated_at" timestamp with time zone, "p_cursor_review_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_my_reviews_with_cursor"("p_limit" integer, "p_cursor_updated_at" timestamp with time zone, "p_cursor_review_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_my_reviews_with_cursor"("p_limit" integer, "p_cursor_updated_at" timestamp with time zone, "p_cursor_review_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_my_reviews_with_cursor"("p_limit" integer, "p_cursor_updated_at" timestamp with time zone, "p_cursor_review_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_place_reviews_with_cursor"("p_place_id" "uuid", "p_limit" integer, "p_cursor_updated_at" timestamp with time zone, "p_cursor_review_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_place_reviews_with_cursor"("p_place_id" "uuid", "p_limit" integer, "p_cursor_updated_at" timestamp with time zone, "p_cursor_review_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_place_reviews_with_cursor"("p_place_id" "uuid", "p_limit" integer, "p_cursor_updated_at" timestamp with time zone, "p_cursor_review_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_place_reviews_with_cursor"("p_place_id" "uuid", "p_limit" integer, "p_cursor_updated_at" timestamp with time zone, "p_cursor_review_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_received_invitations_with_cursor"("p_limit" integer, "p_cursor_created_time" timestamp with time zone, "p_cursor_invitation_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_received_invitations_with_cursor"("p_limit" integer, "p_cursor_created_time" timestamp with time zone, "p_cursor_invitation_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_received_invitations_with_cursor"("p_limit" integer, "p_cursor_created_time" timestamp with time zone, "p_cursor_invitation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_received_invitations_with_cursor"("p_limit" integer, "p_cursor_created_time" timestamp with time zone, "p_cursor_invitation_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_reviewable_appointments_with_stats"("p_user_id" "uuid", "p_offset" integer, "p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_reviewable_appointments_with_stats"("p_user_id" "uuid", "p_offset" integer, "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."list_reviewable_appointments_with_stats"("p_user_id" "uuid", "p_offset" integer, "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_reviewable_appointments_with_stats"("p_user_id" "uuid", "p_offset" integer, "p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."list_reviewable_appointments_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer, "p_cursor_ends_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."list_reviewable_appointments_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer, "p_cursor_ends_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."list_reviewable_appointments_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer, "p_cursor_ends_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_reviewable_appointments_with_stats_cursor"("p_user_id" "uuid", "p_limit" integer, "p_cursor_ends_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."respond_to_invitation_transactional"("p_user_id" "uuid", "p_invitation_id" "uuid", "p_decision" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."respond_to_invitation_transactional"("p_user_id" "uuid", "p_invitation_id" "uuid", "p_decision" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."respond_to_invitation_transactional"("p_user_id" "uuid", "p_invitation_id" "uuid", "p_decision" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."respond_to_invitation_transactional"("p_user_id" "uuid", "p_invitation_id" "uuid", "p_decision" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."search_appointment_invitable_users_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_query" "text", "p_limit" integer, "p_candidate_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."search_appointment_invitable_users_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_query" "text", "p_limit" integer, "p_candidate_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_appointment_invitable_users_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_query" "text", "p_limit" integer, "p_candidate_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_appointment_invitable_users_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_query" "text", "p_limit" integer, "p_candidate_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."search_appointments_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer, "p_cursor_start_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."search_appointments_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer, "p_cursor_start_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_appointments_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer, "p_cursor_start_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_appointments_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer, "p_cursor_start_at" timestamp with time zone, "p_cursor_appointment_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."search_group_invitable_users_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_query" "text", "p_limit" integer, "p_candidate_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."search_group_invitable_users_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_query" "text", "p_limit" integer, "p_candidate_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_group_invitable_users_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_query" "text", "p_limit" integer, "p_candidate_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_group_invitable_users_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_query" "text", "p_limit" integer, "p_candidate_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."search_groups_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer, "p_cursor_name" "text", "p_cursor_group_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."search_groups_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer, "p_cursor_name" "text", "p_cursor_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_groups_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer, "p_cursor_name" "text", "p_cursor_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_groups_with_count"("p_user_id" "uuid", "p_query" "text", "p_limit" integer, "p_cursor_name" "text", "p_cursor_group_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."send_appointment_invitation_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_invitee_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."send_appointment_invitation_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_invitee_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."send_appointment_invitation_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_invitee_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_appointment_invitation_transactional"("p_inviter_id" "uuid", "p_appointment_id" "uuid", "p_invitee_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."send_group_invitation_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_invitee_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."send_group_invitation_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_invitee_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."send_group_invitation_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_invitee_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_group_invitation_transactional"("p_inviter_id" "uuid", "p_group_id" "uuid", "p_invitee_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_user_profile_image_transactional"("p_user_id" "uuid", "p_profile_image" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_user_profile_image_transactional"("p_user_id" "uuid", "p_profile_image" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_profile_image_transactional"("p_user_id" "uuid", "p_profile_image" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_profile_image_transactional"("p_user_id" "uuid", "p_profile_image" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."submit_place_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_score" integer, "p_content" "text", "p_edited_at" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."submit_place_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_score" integer, "p_content" "text", "p_edited_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_place_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_score" integer, "p_content" "text", "p_edited_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_place_review_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_score" integer, "p_content" "text", "p_edited_at" timestamp with time zone) TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_appointment_status_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_status" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_appointment_status_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_appointment_status_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_appointment_status_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_status" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_id" "uuid", "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text", "p_place_latitude" double precision, "p_place_longitude" double precision) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_id" "uuid", "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text", "p_place_latitude" double precision, "p_place_longitude" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."update_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_id" "uuid", "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text", "p_place_latitude" double precision, "p_place_longitude" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_appointment_transactional"("p_user_id" "uuid", "p_appointment_id" "uuid", "p_title" "text", "p_start_at" timestamp with time zone, "p_ends_at" timestamp with time zone, "p_place_id" "uuid", "p_place_kakao_id" "text", "p_place_name" "text", "p_place_address" "text", "p_place_category" "text", "p_place_latitude" double precision, "p_place_longitude" double precision) TO "service_role";
























GRANT ALL ON TABLE "public"."appointment_comments" TO "anon";
GRANT ALL ON TABLE "public"."appointment_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_comments" TO "service_role";



GRANT ALL ON TABLE "public"."appointment_members" TO "anon";
GRANT ALL ON TABLE "public"."appointment_members" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_members" TO "service_role";



GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."group_members" TO "anon";
GRANT ALL ON TABLE "public"."group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."group_members" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."places" TO "anon";
GRANT ALL ON TABLE "public"."places" TO "authenticated";
GRANT ALL ON TABLE "public"."places" TO "service_role";



GRANT ALL ON TABLE "public"."user_notifications" TO "anon";
GRANT ALL ON TABLE "public"."user_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."user_review" TO "anon";
GRANT ALL ON TABLE "public"."user_review" TO "authenticated";
GRANT ALL ON TABLE "public"."user_review" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


  create policy "profile_images_delete_own"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'profile-images'::text) AND (split_part(name, '/'::text, 1) = (auth.uid())::text)));



  create policy "profile_images_insert_own"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'profile-images'::text) AND (split_part(name, '/'::text, 1) = (auth.uid())::text)));



  create policy "profile_images_select_own"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'profile-images'::text) AND (split_part(name, '/'::text, 1) = (auth.uid())::text)));



  create policy "profile_images_update_own"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'profile-images'::text) AND (split_part(name, '/'::text, 1) = (auth.uid())::text)))
with check (((bucket_id = 'profile-images'::text) AND (split_part(name, '/'::text, 1) = (auth.uid())::text)));



