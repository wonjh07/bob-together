export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointment_comments: {
        Row: {
          appointment_id: string
          comment_id: string
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string
          is_deleted: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          comment_id?: string
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string
          is_deleted?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          comment_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string
          is_deleted?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_comments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      appointment_members: {
        Row: {
          appointment_id: string
          created_at: string
          joined_at: string
          role: Database["public"]["Enums"]["appointment_member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["appointment_member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["appointment_member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_members_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "appointment_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_id: string
          created_at: string
          creator_id: string
          ends_at: string
          group_id: string
          is_ended: boolean
          place_id: string
          start_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          title: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string
          created_at?: string
          creator_id: string
          ends_at: string
          group_id: string
          is_ended?: boolean
          place_id: string
          start_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          title: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          creator_id?: string
          ends_at?: string
          group_id?: string
          is_ended?: boolean
          place_id?: string
          start_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "appointments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "appointments_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["place_id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string
          joined_at: string
          role: Database["public"]["Enums"]["group_member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          joined_at?: string
          role?: Database["public"]["Enums"]["group_member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["group_member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          group_id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      invitations: {
        Row: {
          appointment_id: string | null
          created_time: string
          group_id: string
          invitation_id: string
          invitee_id: string
          inviter_id: string
          responded_time: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          type: Database["public"]["Enums"]["invitation_type"]
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_time?: string
          group_id: string
          invitation_id?: string
          invitee_id: string
          inviter_id: string
          responded_time?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          type: Database["public"]["Enums"]["invitation_type"]
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_time?: string
          group_id?: string
          invitation_id?: string
          invitee_id?: string
          inviter_id?: string
          responded_time?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          type?: Database["public"]["Enums"]["invitation_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "invitations_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_time: string
          link_url: string | null
          message: string
          notification_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["notification_target_type"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_time?: string
          link_url?: string | null
          message: string
          notification_id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["notification_target_type"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_time?: string
          link_url?: string | null
          message?: string
          notification_id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["notification_target_type"]
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: []
      }
      places: {
        Row: {
          address: string
          category: string
          created_at: string
          kakao_id: string
          latitude: number
          longitude: number
          name: string
          place_id: string
          updated_at: string
        }
        Insert: {
          address?: string
          category?: string
          created_at?: string
          kakao_id: string
          latitude: number
          longitude: number
          name: string
          place_id?: string
          updated_at?: string
        }
        Update: {
          address?: string
          category?: string
          created_at?: string
          kakao_id?: string
          latitude?: number
          longitude?: number
          name?: string
          place_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          deleted_at: string | null
          is_deleted: boolean
          is_read: boolean
          notification_id: string
          read_at: string | null
          user_id: string
          user_notification_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          is_deleted?: boolean
          is_read?: boolean
          notification_id: string
          read_at?: string | null
          user_id: string
          user_notification_id?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          is_deleted?: boolean
          is_read?: boolean
          notification_id?: string
          read_at?: string | null
          user_id?: string
          user_notification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["notification_id"]
          },
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_review: {
        Row: {
          appointment_id: string | null
          created_at: string
          edited_at: string | null
          place_id: string
          review: string | null
          review_id: string
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          edited_at?: string | null
          place_id: string
          review?: string | null
          review_id?: string
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          edited_at?: string | null
          place_id?: string
          review?: string | null
          review_id?: string
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "user_places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_review_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["appointment_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          name: string
          nickname: string
          profile_image: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          name?: string
          nickname?: string
          profile_image?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          name?: string
          nickname?: string
          profile_image?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: { Args: { p_email: string }; Returns: boolean }
      clear_user_profile_image_transactional: {
        Args: { p_user_id: string }
        Returns: {
          error_code: string
          ok: boolean
          previous_profile_image: string
        }[]
      }
      create_appointment_with_owner_member: {
        Args: {
          p_ends_at: string
          p_group_id: string
          p_place_address: string
          p_place_category?: string
          p_place_kakao_id: string
          p_place_latitude?: number
          p_place_longitude?: number
          p_place_name: string
          p_start_at: string
          p_title: string
          p_user_id: string
        }
        Returns: {
          appointment_id: string
          place_id: string
        }[]
      }
      create_group_transactional: {
        Args: { p_group_name: string; p_owner_id: string }
        Returns: {
          error_code: string
          group_id: string
          group_name: string
          ok: boolean
        }[]
      }
      delete_my_review_transactional: {
        Args: {
          p_appointment_id: string
          p_edited_at?: string
          p_user_id: string
        }
        Returns: {
          appointment_id: string
          error_code: string
          ok: boolean
        }[]
      }
      get_appointment_comments_with_cursor: {
        Args: {
          p_appointment_id: string
          p_cursor_comment_id?: string
          p_cursor_created_at?: string
          p_include_count?: boolean
          p_limit?: number
          p_user_id: string
        }
        Returns: {
          comment_count: number
          comments: Json
          error_code: string
          ok: boolean
        }[]
      }
      get_appointment_detail_with_count: {
        Args: { p_appointment_id: string; p_user_id: string }
        Returns: {
          appointment_id: string
          created_at: string
          creator_id: string
          creator_name: string
          creator_nickname: string
          creator_profile_image: string
          ends_at: string
          is_member: boolean
          member_count: number
          place_address: string
          place_category: string
          place_id: string
          place_latitude: number
          place_longitude: number
          place_name: string
          review_avg: number
          review_count: number
          start_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          title: string
        }[]
      }
      get_appointment_invitation_state_transactional: {
        Args: { p_appointment_id: string; p_user_id: string }
        Returns: {
          error_code: string
          member_ids: string[]
          ok: boolean
          pending_invitee_ids: string[]
        }[]
      }
      get_appointment_members_with_count: {
        Args: { p_appointment_id: string; p_user_id: string }
        Returns: {
          error_code: string
          member_count: number
          members: Json
          ok: boolean
        }[]
      }
      get_appointment_review_target_transactional: {
        Args: { p_appointment_id: string; p_user_id: string }
        Returns: {
          appointment_id: string
          ends_at: string
          error_code: string
          has_my_review_row: boolean
          has_reviewed: boolean
          my_review: string
          my_score: number
          ok: boolean
          place_address: string
          place_category: string
          place_id: string
          place_name: string
          review_avg: number
          review_count: number
          start_at: string
          title: string
        }[]
      }
      get_group_members_with_count: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: {
          error_code: string
          member_count: number
          members: Json
          ok: boolean
        }[]
      }
      get_place_detail_with_stats: {
        Args: { p_place_id: string }
        Returns: {
          address: string
          category: string
          latitude: number
          longitude: number
          name: string
          place_id: string
          review_avg: number
          review_count: number
        }[]
      }
      join_appointment_transactional: {
        Args: { p_appointment_id: string; p_user_id: string }
        Returns: {
          error_code: string
          ok: boolean
        }[]
      }
      join_group_transactional: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: {
          error_code: string
          group_id: string
          ok: boolean
        }[]
      }
      leave_appointment_transactional: {
        Args: { p_appointment_id: string; p_user_id: string }
        Returns: {
          error_code: string
          ok: boolean
        }[]
      }
      leave_group_transactional: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: {
          error_code: string
          group_id: string
          ok: boolean
        }[]
      }
      list_appointment_history_with_stats: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          appointment_id: string
          can_write_review: boolean
          creator_id: string
          creator_name: string
          creator_nickname: string
          creator_profile_image: string
          ends_at: string
          member_count: number
          place_address: string
          place_category: string
          place_id: string
          place_name: string
          review_avg: number
          review_count: number
          start_at: string
          title: string
        }[]
      }
      list_appointment_history_with_stats_cursor: {
        Args: {
          p_cursor_appointment_id?: string
          p_cursor_ends_at?: string
          p_limit?: number
          p_user_id: string
        }
        Returns: {
          appointment_id: string
          can_write_review: boolean
          creator_id: string
          creator_name: string
          creator_nickname: string
          creator_profile_image: string
          ends_at: string
          member_count: number
          place_address: string
          place_category: string
          place_id: string
          place_name: string
          review_avg: number
          review_count: number
          start_at: string
          title: string
        }[]
      }
      list_appointments_with_stats: {
        Args: {
          p_cursor?: string
          p_group_id: string
          p_limit?: number
          p_period?: string
          p_type?: string
          p_user_id: string
        }
        Returns: {
          appointment_id: string
          comment_count: number
          creator_id: string
          creator_name: string
          creator_nickname: string
          ends_at: string
          is_member: boolean
          is_owner: boolean
          member_count: number
          place_address: string
          place_category: string
          place_id: string
          place_name: string
          start_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          title: string
        }[]
      }
      list_appointments_with_stats_cursor: {
        Args: {
          p_cursor_appointment_id?: string
          p_cursor_start_at?: string
          p_group_id: string
          p_limit?: number
          p_period?: string
          p_type?: string
          p_user_id: string
        }
        Returns: {
          appointment_id: string
          comment_count: number
          creator_id: string
          creator_name: string
          creator_nickname: string
          ends_at: string
          is_member: boolean
          is_owner: boolean
          member_count: number
          place_address: string
          place_category: string
          place_id: string
          place_name: string
          start_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          title: string
        }[]
      }
      list_my_comments_with_cursor: {
        Args: {
          p_cursor_comment_id?: string
          p_cursor_created_at?: string
          p_limit?: number
        }
        Returns: {
          appointment_id: string
          appointment_title: string
          comment_id: string
          content: string
          created_at: string
        }[]
      }
      list_my_groups_with_stats: {
        Args: {
          p_cursor_group_id?: string
          p_cursor_joined_at?: string
          p_limit?: number
          p_user_id: string
        }
        Returns: {
          created_at: string
          group_id: string
          group_name: string
          is_owner: boolean
          joined_at: string
          member_count: number
          owner_name: string
          owner_nickname: string
          owner_profile_image: string
        }[]
      }
      list_my_reviews_with_cursor: {
        Args: {
          p_cursor_review_id?: string
          p_cursor_updated_at?: string
          p_limit?: number
        }
        Returns: {
          appointment_id: string
          created_at: string
          edited_at: string
          place_id: string
          place_name: string
          review: string
          review_id: string
          score: number
          updated_at: string
        }[]
      }
      list_place_reviews_with_cursor: {
        Args: {
          p_cursor_review_id?: string
          p_cursor_updated_at?: string
          p_limit?: number
          p_place_id: string
        }
        Returns: {
          edited_at: string
          review: string
          review_id: string
          score: number
          updated_at: string
          user_id: string
          user_name: string
          user_nickname: string
          user_profile_image: string
        }[]
      }
      list_received_invitations_with_cursor: {
        Args: {
          p_cursor_created_time?: string
          p_cursor_invitation_id?: string
          p_limit?: number
        }
        Returns: {
          appointment_ends_at: string
          appointment_id: string
          appointment_title: string
          created_time: string
          group_id: string
          group_name: string
          invitation_id: string
          inviter_id: string
          inviter_name: string
          inviter_nickname: string
          inviter_profile_image: string
          status: string
          type: string
        }[]
      }
      list_reviewable_appointments_with_stats: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          appointment_id: string
          ends_at: string
          place_id: string
          place_name: string
          review_avg: number
          review_count: number
          start_at: string
          title: string
        }[]
      }
      list_reviewable_appointments_with_stats_cursor: {
        Args: {
          p_cursor_appointment_id?: string
          p_cursor_ends_at?: string
          p_limit?: number
          p_user_id: string
        }
        Returns: {
          appointment_id: string
          ends_at: string
          place_id: string
          place_name: string
          review_avg: number
          review_count: number
          start_at: string
          title: string
        }[]
      }
      respond_to_invitation_transactional: {
        Args: { p_decision: string; p_invitation_id: string; p_user_id: string }
        Returns: {
          appointment_id: string
          error_code: string
          group_id: string
          invitation_id: string
          invitation_type: string
          ok: boolean
          status: string
        }[]
      }
      search_appointment_invitable_users_transactional: {
        Args: {
          p_appointment_id: string
          p_candidate_limit?: number
          p_inviter_id: string
          p_limit?: number
          p_query: string
        }
        Returns: {
          error_code: string
          ok: boolean
          users: Json
        }[]
      }
      search_appointments_with_count: {
        Args: {
          p_cursor_appointment_id?: string
          p_cursor_start_at?: string
          p_limit?: number
          p_query: string
          p_user_id: string
        }
        Returns: {
          appointment_id: string
          ends_at: string
          host_name: string
          host_nickname: string
          host_profile_image: string
          member_count: number
          start_at: string
          title: string
        }[]
      }
      search_group_invitable_users_transactional: {
        Args: {
          p_candidate_limit?: number
          p_group_id: string
          p_inviter_id: string
          p_limit?: number
          p_query: string
        }
        Returns: {
          error_code: string
          ok: boolean
          pending_invitee_ids: string[]
          users: Json
        }[]
      }
      search_groups_with_count: {
        Args: {
          p_cursor_group_id?: string
          p_cursor_name?: string
          p_limit?: number
          p_query: string
          p_user_id: string
        }
        Returns: {
          group_id: string
          group_name: string
          is_member: boolean
          member_count: number
          owner_name: string
          owner_nickname: string
          owner_profile_image: string
        }[]
      }
      send_appointment_invitation_transactional: {
        Args: {
          p_appointment_id: string
          p_invitee_id: string
          p_inviter_id: string
        }
        Returns: {
          error_code: string
          ok: boolean
        }[]
      }
      send_group_invitation_transactional: {
        Args: { p_group_id: string; p_invitee_id: string; p_inviter_id: string }
        Returns: {
          error_code: string
          ok: boolean
        }[]
      }
      set_user_profile_image_transactional: {
        Args: { p_profile_image: string; p_user_id: string }
        Returns: {
          error_code: string
          ok: boolean
          previous_profile_image: string
        }[]
      }
      submit_place_review_transactional: {
        Args: {
          p_appointment_id: string
          p_content: string
          p_edited_at?: string
          p_score: number
          p_user_id: string
        }
        Returns: {
          appointment_id: string
          error_code: string
          mode: string
          ok: boolean
          place_id: string
        }[]
      }
      update_appointment_status_transactional: {
        Args: { p_appointment_id: string; p_status: string; p_user_id: string }
        Returns: {
          error_code: string
          ok: boolean
          status: string
        }[]
      }
      update_appointment_transactional: {
        Args: {
          p_appointment_id: string
          p_ends_at: string
          p_place_address?: string
          p_place_category?: string
          p_place_id?: string
          p_place_kakao_id?: string
          p_place_latitude?: number
          p_place_longitude?: number
          p_place_name?: string
          p_start_at: string
          p_title: string
          p_user_id: string
        }
        Returns: {
          appointment_id: string
          error_code: string
          ok: boolean
        }[]
      }
    }
    Enums: {
      appointment_member_role: "owner" | "member"
      appointment_status: "pending" | "canceled"
      group_member_role: "owner" | "member"
      invitation_status: "pending" | "accepted" | "rejected" | "canceled"
      invitation_type: "group" | "appointment"
      notification_target_type: "group" | "appointment"
      notification_type: "invite" | "review" | "confirmed" | "comment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_member_role: ["owner", "member"],
      appointment_status: ["pending", "canceled"],
      group_member_role: ["owner", "member"],
      invitation_status: ["pending", "accepted", "rejected", "canceled"],
      invitation_type: ["group", "appointment"],
      notification_target_type: ["group", "appointment"],
      notification_type: ["invite", "review", "confirmed", "comment"],
    },
  },
} as const
