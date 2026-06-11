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
      canonical_events: {
        Row: {
          best_image_url: string | null
          best_source_id: string | null
          best_source_type: string | null
          breeder_name: string | null
          breeder_name_normalized: string | null
          created_at: string
          event_date: string | null
          id: string
          kind: string
          placement_slot: string | null
          post_count: number
          show_name: string
          show_name_normalized: string
          species: string | null
          updated_at: string
          verified_level: string
        }
        Insert: {
          best_image_url?: string | null
          best_source_id?: string | null
          best_source_type?: string | null
          breeder_name?: string | null
          breeder_name_normalized?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          kind: string
          placement_slot?: string | null
          post_count?: number
          show_name: string
          show_name_normalized: string
          species?: string | null
          updated_at?: string
          verified_level?: string
        }
        Update: {
          best_image_url?: string | null
          best_source_id?: string | null
          best_source_type?: string | null
          breeder_name?: string | null
          breeder_name_normalized?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          kind?: string
          placement_slot?: string | null
          post_count?: number
          show_name?: string
          show_name_normalized?: string
          species?: string | null
          updated_at?: string
          verified_level?: string
        }
        Relationships: []
      }
      catalog_breeders: {
        Row: {
          accent_color: string
          created_at: string
          id: string
          name: string
          website: string | null
        }
        Insert: {
          accent_color?: string
          created_at?: string
          id?: string
          name: string
          website?: string | null
        }
        Update: {
          accent_color?: string
          created_at?: string
          id?: string
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      catalog_sires: {
        Row: {
          breeder_id: string
          created_at: string
          dwarf: string | null
          genotype: string | null
          id: string
          notes: string | null
          ownership: string | null
          pedigree: string | null
          photo_url: string | null
          price: number | null
          scrapie: string | null
          semen_available: boolean
          sire_name: string
          species: string
          spider: string | null
          updated_at: string
        }
        Insert: {
          breeder_id: string
          created_at?: string
          dwarf?: string | null
          genotype?: string | null
          id?: string
          notes?: string | null
          ownership?: string | null
          pedigree?: string | null
          photo_url?: string | null
          price?: number | null
          scrapie?: string | null
          semen_available?: boolean
          sire_name: string
          species?: string
          spider?: string | null
          updated_at?: string
        }
        Update: {
          breeder_id?: string
          created_at?: string
          dwarf?: string | null
          genotype?: string | null
          id?: string
          notes?: string | null
          ownership?: string | null
          pedigree?: string | null
          photo_url?: string | null
          price?: number | null
          scrapie?: string | null
          semen_available?: boolean
          sire_name?: string
          species?: string
          spider?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_sires_breeder_id_fkey"
            columns: ["breeder_id"]
            isOneToOne: false
            referencedRelation: "catalog_breeders"
            referencedColumns: ["id"]
          },
        ]
      }
      event_aliases: {
        Row: {
          alias: string
          alias_normalized: string
          canonical_name: string
          canonical_normalized: string
          created_at: string
          id: string
        }
        Insert: {
          alias: string
          alias_normalized: string
          canonical_name: string
          canonical_normalized: string
          created_at?: string
          id?: string
        }
        Update: {
          alias?: string
          alias_normalized?: string
          canonical_name?: string
          canonical_normalized?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      event_links: {
        Row: {
          canonical_event_id: string
          contributor_kind: string | null
          created_at: string
          id: string
          source_id: string
          source_type: string
        }
        Insert: {
          canonical_event_id: string
          contributor_kind?: string | null
          created_at?: string
          id?: string
          source_id: string
          source_type: string
        }
        Update: {
          canonical_event_id?: string
          contributor_kind?: string | null
          created_at?: string
          id?: string
          source_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_links_canonical_event_id_fkey"
            columns: ["canonical_event_id"]
            isOneToOne: false
            referencedRelation: "canonical_events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_featured: boolean
          is_live: boolean
          location: string | null
          name: string
          slug: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_featured?: boolean
          is_live?: boolean
          location?: string | null
          name: string
          slug: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_featured?: boolean
          is_live?: boolean
          location?: string | null
          name?: string
          slug?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      exhibitor_animal_context: {
        Row: {
          breeder_id: string | null
          created_at: string
          dam_name: string | null
          exhibitor_name: string
          id: string
          last_used_at: string
          show_id: string | null
          show_name: string | null
          sire_id: string | null
          sire_name: string | null
          use_count: number
          user_id: string
        }
        Insert: {
          breeder_id?: string | null
          created_at?: string
          dam_name?: string | null
          exhibitor_name: string
          id?: string
          last_used_at?: string
          show_id?: string | null
          show_name?: string | null
          sire_id?: string | null
          sire_name?: string | null
          use_count?: number
          user_id: string
        }
        Update: {
          breeder_id?: string | null
          created_at?: string
          dam_name?: string | null
          exhibitor_name?: string
          id?: string
          last_used_at?: string
          show_id?: string | null
          show_name?: string | null
          sire_id?: string | null
          sire_name?: string | null
          use_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exhibitor_animal_context_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exhibitor_animal_context_sire_id_fkey"
            columns: ["sire_id"]
            isOneToOne: false
            referencedRelation: "sires_lookup"
            referencedColumns: ["id"]
          },
        ]
      }
      exhibitors: {
        Row: {
          created_at: string
          created_by_user_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      live_updates: {
        Row: {
          created_by: string | null
          event_id: string
          id: string
          image_url: string | null
          line_1: string
          line_2: string | null
          posted_at: string
          sale_record_id: string | null
          species: string | null
          title: string
          update_type: string
          winner_record_id: string | null
        }
        Insert: {
          created_by?: string | null
          event_id: string
          id?: string
          image_url?: string | null
          line_1: string
          line_2?: string | null
          posted_at?: string
          sale_record_id?: string | null
          species?: string | null
          title: string
          update_type?: string
          winner_record_id?: string | null
        }
        Update: {
          created_by?: string | null
          event_id?: string
          id?: string
          image_url?: string | null
          line_1?: string
          line_2?: string | null
          posted_at?: string
          sale_record_id?: string | null
          species?: string | null
          title?: string
          update_type?: string
          winner_record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_updates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_updates_sale_record_id_fkey"
            columns: ["sale_record_id"]
            isOneToOne: false
            referencedRelation: "sale_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_updates_winner_record_id_fkey"
            columns: ["winner_record_id"]
            isOneToOne: false
            referencedRelation: "winner_records"
            referencedColumns: ["id"]
          },
        ]
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
      posts: {
        Row: {
          caption: string | null
          comments: number
          created_at: string
          id: string
          image_urls: string[] | null
          likes: number
          post_type: string
          posted_as_breeder_id: string | null
          show_on_feed: boolean
          status: string
          tags: string[] | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          caption?: string | null
          comments?: number
          created_at?: string
          id?: string
          image_urls?: string[] | null
          likes?: number
          post_type?: string
          posted_as_breeder_id?: string | null
          show_on_feed?: boolean
          status?: string
          tags?: string[] | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          caption?: string | null
          comments?: number
          created_at?: string
          id?: string
          image_urls?: string[] | null
          likes?: number
          post_type?: string
          posted_as_breeder_id?: string | null
          show_on_feed?: boolean
          status?: string
          tags?: string[] | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_posted_as_breeder_id_fkey"
            columns: ["posted_as_breeder_id"]
            isOneToOne: false
            referencedRelation: "breeder_profiles"
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
          email_verified: boolean
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
          email_verified?: boolean
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
          email_verified?: boolean
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
      sale_records: {
        Row: {
          breeder_name: string | null
          buyer_name: string | null
          created_at: string
          event_id: string
          id: string
          image_url: string | null
          lot_number: string | null
          price: number | null
          source: string | null
          species: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          breeder_name?: string | null
          buyer_name?: string | null
          created_at?: string
          event_id: string
          id?: string
          image_url?: string | null
          lot_number?: string | null
          price?: number | null
          source?: string | null
          species?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          breeder_name?: string | null
          buyer_name?: string | null
          created_at?: string
          event_id?: string
          id?: string
          image_url?: string | null
          lot_number?: string | null
          price?: number | null
          source?: string | null
          species?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_source_status: {
        Row: {
          last_attempt_at: string | null
          last_error: string | null
          last_success_at: string | null
          source: string
          updated_at: string
        }
        Insert: {
          last_attempt_at?: string | null
          last_error?: string | null
          last_success_at?: string | null
          source: string
          updated_at?: string
        }
        Update: {
          last_attempt_at?: string | null
          last_error?: string | null
          last_success_at?: string | null
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      scraped_results: {
        Row: {
          created_at: string
          id: string
          location: string | null
          managed_by: string | null
          sale_date: string | null
          sale_name: string | null
          scraped_at: string
          source: string
          source_key: string
          source_url: string | null
          top_lots: Json
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          managed_by?: string | null
          sale_date?: string | null
          sale_name?: string | null
          scraped_at?: string
          source: string
          source_key: string
          source_url?: string | null
          top_lots?: Json
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          managed_by?: string | null
          sale_date?: string | null
          sale_name?: string | null
          scraped_at?: string
          source?: string
          source_key?: string
          source_url?: string | null
          top_lots?: Json
        }
        Relationships: []
      }
      scraped_upcoming: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          link: string | null
          location: string | null
          sale_date: string | null
          sale_name: string | null
          scraped_at: string
          seller: string | null
          source: string
          source_key: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          link?: string | null
          location?: string | null
          sale_date?: string | null
          sale_name?: string | null
          scraped_at?: string
          seller?: string | null
          source: string
          source_key: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          link?: string | null
          location?: string | null
          sale_date?: string | null
          sale_name?: string | null
          scraped_at?: string
          seller?: string | null
          source?: string
          source_key?: string
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
      user_exhibitors: {
        Row: {
          exhibitor_id: string
          id: string
          label: string
          last_breeder_id: string | null
          last_dam_name: string | null
          last_show_name: string | null
          last_sire_name: string | null
          last_used_at: string
          use_count: number
          user_id: string
        }
        Insert: {
          exhibitor_id: string
          id?: string
          label?: string
          last_breeder_id?: string | null
          last_dam_name?: string | null
          last_show_name?: string | null
          last_sire_name?: string | null
          last_used_at?: string
          use_count?: number
          user_id: string
        }
        Update: {
          exhibitor_id?: string
          id?: string
          label?: string
          last_breeder_id?: string | null
          last_dam_name?: string | null
          last_show_name?: string | null
          last_sire_name?: string | null
          last_used_at?: string
          use_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exhibitors_exhibitor_id_fkey"
            columns: ["exhibitor_id"]
            isOneToOne: false
            referencedRelation: "exhibitors"
            referencedColumns: ["id"]
          },
        ]
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
      winner_records: {
        Row: {
          breeder_name: string | null
          created_at: string
          dam: string | null
          event_id: string
          exhibitor_name: string
          id: string
          image_url: string | null
          placed_by: string | null
          result_title: string
          sire_name: string | null
          source: string | null
          species: string | null
          status: string
          updated_at: string
        }
        Insert: {
          breeder_name?: string | null
          created_at?: string
          dam?: string | null
          event_id: string
          exhibitor_name: string
          id?: string
          image_url?: string | null
          placed_by?: string | null
          result_title: string
          sire_name?: string | null
          source?: string | null
          species?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          breeder_name?: string | null
          created_at?: string
          dam?: string | null
          event_id?: string
          exhibitor_name?: string
          id?: string
          image_url?: string | null
          placed_by?: string | null
          result_title?: string
          sire_name?: string | null
          source?: string | null
          species?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "winner_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          source_post_id: string | null
          species: string | null
          status: Database["public"]["Enums"]["post_status"]
          tags: string[] | null
          title: string
          user_id: string | null
          video_url: string | null
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
          source_post_id?: string | null
          species?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[] | null
          title: string
          user_id?: string | null
          video_url?: string | null
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
          source_post_id?: string | null
          species?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[] | null
          title?: string
          user_id?: string | null
          video_url?: string | null
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
          {
            foreignKeyName: "winners_source_post_id_fkey"
            columns: ["source_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
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
      match_or_create_event: {
        Args: {
          _breeder_name: string
          _contributor_kind: string
          _event_date: string
          _image_url: string
          _kind: string
          _placement_slot: string
          _show_name: string
          _source_id: string
          _source_type: string
          _species: string
        }
        Returns: string
      }
      normalize_event_name: { Args: { _raw: string }; Returns: string }
      resolve_event_alias: { Args: { _normalized: string }; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
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
