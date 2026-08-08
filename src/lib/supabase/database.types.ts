export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academy_form_definitions: {
        Row: {
          created_at: string
          description: string
          display_order: number
          form_schema: Json
          id: string
          is_required: boolean
          product_id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          form_schema?: Json
          id?: string
          is_required?: boolean
          product_id: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          form_schema?: Json
          id?: string
          is_required?: boolean
          product_id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_form_definitions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_form_submissions: {
        Row: {
          answers: Json
          created_at: string
          enrollment_id: string
          form_definition_id: string
          id: string
          product_id: string
          profile_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          enrollment_id: string
          form_definition_id: string
          id?: string
          product_id: string
          profile_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          enrollment_id?: string
          form_definition_id?: string
          id?: string
          product_id?: string
          profile_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_form_submissions_enrollment_scope_fkey"
            columns: ["enrollment_id", "profile_id", "product_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id", "profile_id", "product_id"]
          },
          {
            foreignKeyName: "academy_form_submissions_form_product_fkey"
            columns: ["form_definition_id", "product_id"]
            isOneToOne: false
            referencedRelation: "academy_form_definitions"
            referencedColumns: ["id", "product_id"]
          },
          {
            foreignKeyName: "academy_form_submissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_form_submissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_mentorship_bookings: {
        Row: {
          booked_at: string
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          participant_note: string | null
          participant_timezone: string
          product_id: string
          profile_id: string
          slot_id: string
          status: string
          updated_at: string
        }
        Insert: {
          booked_at?: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          participant_note?: string | null
          participant_timezone: string
          product_id: string
          profile_id: string
          slot_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          booked_at?: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          participant_note?: string | null
          participant_timezone?: string
          product_id?: string
          profile_id?: string
          slot_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_mentorship_bookings_enrollment_scope_fkey"
            columns: ["enrollment_id", "profile_id", "product_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id", "profile_id", "product_id"]
          },
          {
            foreignKeyName: "academy_mentorship_bookings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_mentorship_bookings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_mentorship_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "academy_mentorship_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_mentorship_notes: {
        Row: {
          booking_id: string
          concepts_to_reinforce: string | null
          created_at: string
          created_by: string
          enrollment_id: string
          id: string
          next_steps: string | null
          preparation_notes: string | null
          product_id: string
          profile_id: string
          resources_to_send: string | null
          session_conclusions: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          concepts_to_reinforce?: string | null
          created_at?: string
          created_by: string
          enrollment_id: string
          id?: string
          next_steps?: string | null
          preparation_notes?: string | null
          product_id: string
          profile_id: string
          resources_to_send?: string | null
          session_conclusions?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          concepts_to_reinforce?: string | null
          created_at?: string
          created_by?: string
          enrollment_id?: string
          id?: string
          next_steps?: string | null
          preparation_notes?: string | null
          product_id?: string
          profile_id?: string
          resources_to_send?: string | null
          session_conclusions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_mentorship_notes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "academy_mentorship_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_mentorship_notes_booking_scope_fkey"
            columns: ["booking_id", "profile_id", "product_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "academy_mentorship_bookings"
            referencedColumns: [
              "id",
              "profile_id",
              "product_id",
              "enrollment_id",
            ]
          },
          {
            foreignKeyName: "academy_mentorship_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_mentorship_notes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_mentorship_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_mentorship_outcomes: {
        Row: {
          booking_id: string
          created_at: string
          enrollment_id: string
          id: string
          next_steps: string | null
          product_id: string
          profile_id: string
          resources: string | null
          shared_at: string | null
          shared_by: string | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          enrollment_id: string
          id?: string
          next_steps?: string | null
          product_id: string
          profile_id: string
          resources?: string | null
          shared_at?: string | null
          shared_by?: string | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          next_steps?: string | null
          product_id?: string
          profile_id?: string
          resources?: string | null
          shared_at?: string | null
          shared_by?: string | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_mentorship_outcomes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "academy_mentorship_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_mentorship_outcomes_booking_scope_fkey"
            columns: ["booking_id", "profile_id", "product_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "academy_mentorship_bookings"
            referencedColumns: [
              "id",
              "profile_id",
              "product_id",
              "enrollment_id",
            ]
          },
          {
            foreignKeyName: "academy_mentorship_outcomes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_mentorship_outcomes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_mentorship_outcomes_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_mentorship_slots: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string
          id: string
          starts_at: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at: string
          id?: string
          starts_at: string
          status?: string
          timezone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string
          id?: string
          starts_at?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_mentorship_slots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_module_reflection_attachments: {
        Row: {
          created_at: string
          enrollment_id: string
          id: string
          mime_type: string
          module_key: string
          original_name: string
          product_id: string
          profile_id: string
          reflection_id: string
          size_bytes: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          id?: string
          mime_type: string
          module_key: string
          original_name: string
          product_id: string
          profile_id: string
          reflection_id: string
          size_bytes: number
          storage_path: string
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          id?: string
          mime_type?: string
          module_key?: string
          original_name?: string
          product_id?: string
          profile_id?: string
          reflection_id?: string
          size_bytes?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_module_reflection_attachments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_module_reflection_attachments_module_scope_fkey"
            columns: ["product_id", "module_key"]
            isOneToOne: false
            referencedRelation: "academy_modules"
            referencedColumns: ["product_id", "module_key"]
          },
          {
            foreignKeyName: "academy_module_reflection_attachments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_module_reflection_attachments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_module_reflection_attachments_reflection_id_fkey"
            columns: ["reflection_id"]
            isOneToOne: false
            referencedRelation: "academy_module_reflections"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_module_reflections: {
        Row: {
          content: string
          created_at: string
          enrollment_id: string
          id: string
          module_key: string
          product_id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          enrollment_id: string
          id?: string
          module_key: string
          product_id: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          module_key?: string
          product_id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_module_reflections_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_module_reflections_module_scope_fkey"
            columns: ["product_id", "module_key"]
            isOneToOne: false
            referencedRelation: "academy_modules"
            referencedColumns: ["product_id", "module_key"]
          },
          {
            foreignKeyName: "academy_module_reflections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_module_reflections_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_module_videos: {
        Row: {
          created_at: string
          description: string
          duration_seconds: number | null
          id: string
          module_id: string
          placeholder: string
          provider: string | null
          provider_video_id: string | null
          published_at: string | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_key: string
          video_order: number
        }
        Insert: {
          created_at?: string
          description?: string
          duration_seconds?: number | null
          id?: string
          module_id: string
          placeholder?: string
          provider?: string | null
          provider_video_id?: string | null
          published_at?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_key: string
          video_order: number
        }
        Update: {
          created_at?: string
          description?: string
          duration_seconds?: number | null
          id?: string
          module_id?: string
          placeholder?: string
          provider?: string | null
          provider_video_id?: string | null
          published_at?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_key?: string
          video_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "academy_module_videos_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "academy_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_modules: {
        Row: {
          availability: string
          created_at: string
          description: string
          estimated_duration_minutes: number | null
          id: string
          learning_objectives: Json
          module_key: string
          module_order: number
          overview: string
          product_id: string
          published_at: string | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          availability?: string
          created_at?: string
          description?: string
          estimated_duration_minutes?: number | null
          id?: string
          learning_objectives?: Json
          module_key: string
          module_order: number
          overview?: string
          product_id: string
          published_at?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          availability?: string
          created_at?: string
          description?: string
          estimated_duration_minutes?: number | null
          id?: string
          learning_objectives?: Json
          module_key?: string
          module_order?: number
          overview?: string
          product_id?: string
          published_at?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_modules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_resources: {
        Row: {
          created_at: string
          description: string
          id: string
          metadata: Json
          module_id: string
          published_at: string | null
          resource_key: string
          resource_order: number
          resource_type: string
          status: string
          storage_path: string | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          module_id: string
          published_at?: string | null
          resource_key: string
          resource_order: number
          resource_type: string
          status?: string
          storage_path?: string | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          module_id?: string
          published_at?: string | null
          resource_key?: string
          resource_order?: number
          resource_type?: string
          status?: string
          storage_path?: string | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_resources_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "academy_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_trading_days: {
        Row: {
          created_at: string
          enrollment_id: string
          id: string
          notes: string | null
          product_id: string
          profile_id: string
          trading_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          id?: string
          notes?: string | null
          product_id: string
          profile_id: string
          trading_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          id?: string
          notes?: string | null
          product_id?: string
          profile_id?: string
          trading_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_trading_days_enrollment_scope_fkey"
            columns: ["enrollment_id", "profile_id", "product_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id", "profile_id", "product_id"]
          },
          {
            foreignKeyName: "academy_trading_days_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_trading_days_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          access_source: string
          created_at: string
          expires_at: string | null
          id: string
          product_id: string
          profile_id: string
          revocation_source: string | null
          revoked_at: string | null
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          access_source?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          product_id: string
          profile_id: string
          revocation_source?: string | null
          revoked_at?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          access_source?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          product_id?: string
          profile_id?: string
          revocation_source?: string | null
          revoked_at?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_scenarios: {
        Row: {
          created_at: string
          description: string
          document_url: string | null
          event_date: string | null
          id: string
          instrument: string
          market: string
          metadata: Json
          published_at: string | null
          scenario_key: string
          scenario_type: string
          status: string
          summary: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_id: string | null
          video_provider: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          document_url?: string | null
          event_date?: string | null
          id?: string
          instrument?: string
          market: string
          metadata?: Json
          published_at?: string | null
          scenario_key: string
          scenario_type: string
          status?: string
          summary?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_id?: string | null
          video_provider?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          document_url?: string | null
          event_date?: string | null
          id?: string
          instrument?: string
          market?: string
          metadata?: Json
          published_at?: string | null
          scenario_key?: string
          scenario_type?: string
          status?: string
          summary?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_id?: string | null
          video_provider?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      module_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_seen_at: string | null
          module_key: string
          product_id: string
          profile_id: string
          progress_percent: number
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_seen_at?: string | null
          module_key: string
          product_id: string
          profile_id: string
          progress_percent?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_seen_at?: string | null
          module_key?: string
          product_id?: string
          profile_id?: string
          progress_percent?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_events: {
        Row: {
          actor_profile_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          occurred_at: string
          purchase_id: string
          source: string
          summary: string | null
        }
        Insert: {
          actor_profile_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          purchase_id: string
          source: string
          summary?: string | null
        }
        Update: {
          actor_profile_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          purchase_id?: string
          source?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_events_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount_refunded_minor: number
          amount_total_minor: number | null
          created_at: string
          currency: string
          enrollment_id: string | null
          id: string
          payment_provider: string
          product_id: string
          profile_id: string
          provider_checkout_session_id: string | null
          provider_payment_intent_id: string | null
          purchase_number: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_refunded_minor?: number
          amount_total_minor?: number | null
          created_at?: string
          currency?: string
          enrollment_id?: string | null
          id?: string
          payment_provider?: string
          product_id: string
          profile_id: string
          provider_checkout_session_id?: string | null
          provider_payment_intent_id?: string | null
          purchase_number?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_refunded_minor?: number
          amount_total_minor?: number | null
          created_at?: string
          currency?: string
          enrollment_id?: string | null
          id?: string
          payment_provider?: string
          product_id?: string
          profile_id?: string
          provider_checkout_session_id?: string | null
          provider_payment_intent_id?: string | null
          purchase_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          api_version: string | null
          attempt_count: number
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          last_error_code: string | null
          livemode: boolean
          payload_summary: Json | null
          processed_at: string | null
          processing_status: string
          purchase_id: string | null
          received_at: string
          stripe_event_id: string
          updated_at: string
        }
        Insert: {
          api_version?: string | null
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          last_error_code?: string | null
          livemode?: boolean
          payload_summary?: Json | null
          processed_at?: string | null
          processing_status?: string
          purchase_id?: string | null
          received_at?: string
          stripe_event_id: string
          updated_at?: string
        }
        Update: {
          api_version?: string | null
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          last_error_code?: string | null
          livemode?: boolean
          payload_summary?: Json | null
          processed_at?: string | null
          processing_status?: string
          purchase_id?: string | null
          received_at?: string
          stripe_event_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_webhook_events_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_mentorship_slot: {
        Args: {
          p_note?: string
          p_participant_timezone: string
          p_slot_id: string
        }
        Returns: {
          booked_at: string
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          participant_note: string | null
          participant_timezone: string
          product_id: string
          profile_id: string
          slot_id: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "academy_mentorship_bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_mentorship_booking: {
        Args: { p_booking_id: string }
        Returns: {
          booked_at: string
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          participant_note: string | null
          participant_timezone: string
          product_id: string
          profile_id: string
          slot_id: string
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "academy_mentorship_bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fulfill_paid_purchase: {
        Args: { p_purchase_id: string }
        Returns: {
          enrollment_created: boolean
          enrollment_id: string
          event_created: boolean
          outcome: string
          purchase_id: string
        }[]
      }
      mark_module_completed: {
        Args: { p_module_key: string; p_product_slug: string }
        Returns: {
          completed_at: string | null
          created_at: string
          id: string
          last_seen_at: string | null
          module_key: string
          product_id: string
          profile_id: string
          progress_percent: number
          started_at: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "module_progress"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      restore_purchase_enrollment: {
        Args: { p_purchase_id: string; p_summary?: string }
        Returns: {
          enrollment_id: string
          enrollment_restored: boolean
          event_created: boolean
          purchase_id: string
        }[]
      }
      revoke_purchase_enrollment: {
        Args: {
          p_purchase_id: string
          p_revocation_source: string
          p_summary?: string
        }
        Returns: {
          enrollment_id: string
          enrollment_revoked: boolean
          event_created: boolean
          purchase_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
