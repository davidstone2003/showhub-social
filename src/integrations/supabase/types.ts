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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      breeder_profiles: {
        Row: {
          breeder_name: string
          breeder_slug: string
          created_at: string
          id: string
          location: string | null
          logo_url: string | null
          owner_user_id: string
          short_bio: string | null
        }
        Insert: {
          breeder_name: string
          breeder_slug: string
          created_at?: string
          id?: string
          location?: string | null
          logo_url?: string | null
          owner_user_id: string
          short_bio?: string | null
        }
        Update: {
          breeder_name?: string
          breeder_slug?: string
          created_at?: string
          id?: string
          location?: string | null
          logo_url?: string | null
          owner_user_id?: string
          short_bio?: string | null
        }
        Relationships: []
      }
      breeders_lookup: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          note: string | null
          post_id: string
          reason: Database["public"]["Enums"]["flag_reason"] | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          note?: string | null
          post_id: string
          reason?: Database["public"]["Enums"]["flag_reason"] | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          note?: string | null
          post_id?: string
          reason?: Database["public"]["Enums"]["flag_reason"] | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "winners"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          related_post_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          related_post_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          related_post_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "winners"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          bio: string | null
          created_at: string
          display_name: string | null
          facebook_url: string | null
          first_name: string | null
          hero_image_url: string | null
          id: string
          instagram_url: string | null
          is_premium: boolean
          last_name: string | null
          location: string | null
          logo_url: string | null
          onboarding_completed: boolean
          phone: string | null
          subscription_tier: string
          tagline: string | null
          username: string
          website_url: string | null
        }
        Insert: {
          account_type?: string
          bio?: string | null
          created_at?: string
          display_name?: string | null
          facebook_url?: string | null
          first_name?: string | null
          hero_image_url?: string | null
          id: string
          instagram_url?: string | null
          is_premium?: boolean
          last_name?: string | null
          location?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          subscription_tier?: string
          tagline?: string | null
          username: string
          website_url?: string | null
        }
        Update: {
          account_type?: string
          bio?: string | null
          created_at?: string
          display_name?: string | null
          facebook_url?: string | null
          first_name?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_url?: string | null
          is_premium?: boolean
          last_name?: string | null
          location?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          subscription_tier?: string
          tagline?: string | null
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
      shows: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      sires_lookup: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      winners: {
        Row: {
          bred_by: string | null
          breeder_id: string | null
          caption: string | null
          comments: number
          created_at: string
          dam: string | null
          date: string
          id: string
          image_urls: string[] | null
          is_featured: boolean
          likes: number
          placed_by: string | null
          post_type: string
          posted_as_breeder_id: string | null
          show_id: string | null
          show_name: string
          show_on_breeder_page: boolean
          show_on_feed: boolean
          show_on_winners_archive: boolean
          shown_by: string
          sire_id: string | null
          sired_by: string | null
          status: Database["public"]["Enums"]["post_status"]
          tags: string[] | null
          title: string
          user_id: string | null
          win_placing: string | null
        }
        Insert: {
          bred_by?: string | null
          breeder_id?: string | null
          caption?: string | null
          comments?: number
          created_at?: string
          dam?: string | null
          date?: string
          id?: string
          image_urls?: string[] | null
          is_featured?: boolean
          likes?: number
          placed_by?: string | null
          post_type?: string
          posted_as_breeder_id?: string | null
          show_id?: string | null
          show_name: string
          show_on_breeder_page?: boolean
          show_on_feed?: boolean
          show_on_winners_archive?: boolean
          shown_by: string
          sire_id?: string | null
          sired_by?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[] | null
          title: string
          user_id?: string | null
          win_placing?: string | null
        }
        Update: {
          bred_by?: string | null
          breeder_id?: string | null
          caption?: string | null
          comments?: number
          created_at?: string
          dam?: string | null
          date?: string
          id?: string
          image_urls?: string[] | null
          is_featured?: boolean
          likes?: number
          placed_by?: string | null
          post_type?: string
          posted_as_breeder_id?: string | null
          show_id?: string | null
          show_name?: string
          show_on_breeder_page?: boolean
          show_on_feed?: boolean
          show_on_winners_archive?: boolean
          shown_by?: string
          sire_id?: string | null
          sired_by?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[] | null
          title?: string
          user_id?: string | null
          win_placing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "winners_breeder_id_fkey"
            columns: ["breeder_id"]
            isOneToOne: false
            referencedRelation: "breeders_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_posted_as_breeder_id_fkey"
            columns: ["posted_as_breeder_id"]
            isOneToOne: false
            referencedRelation: "breeder_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "sires_lookup"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      flag_reason: "inappropriate" | "spam" | "copyright" | "other"
      post_status: "active" | "flagged" | "restricted" | "removed"
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
      app_role: ["admin", "moderator", "user"],
      flag_reason: ["inappropriate", "spam", "copyright", "other"],
      post_status: ["active", "flagged", "restricted", "removed"],
    },
  },
} as const
