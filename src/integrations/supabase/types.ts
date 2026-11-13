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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      contact_requests: {
        Row: {
          created_at: string
          employer_id: string
          id: string
          message: string
          nanny_id: string
          status: string
        }
        Insert: {
          created_at?: string
          employer_id: string
          id?: string
          message: string
          nanny_id: string
          status?: string
        }
        Update: {
          created_at?: string
          employer_id?: string
          id?: string
          message?: string
          nanny_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "contact_requests_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: false
            referencedRelation: "nanny_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          expires_on: string | null
          id: string
          kind: Database["public"]["Enums"]["document_kind"]
          owner_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string
        }
        Insert: {
          created_at?: string
          expires_on?: string | null
          id?: string
          kind: Database["public"]["Enums"]["document_kind"]
          owner_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path: string
        }
        Update: {
          created_at?: string
          expires_on?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          owner_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_profiles: {
        Row: {
          arrangement: string | null
          benefits: string[]
          city: string | null
          created_at: string
          duties: string | null
          household: string | null
          offered_salary_php: number | null
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          arrangement?: string | null
          benefits?: string[]
          city?: string | null
          created_at?: string
          duties?: string | null
          household?: string | null
          offered_salary_php?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          arrangement?: string | null
          benefits?: string[]
          city?: string | null
          created_at?: string
          duties?: string | null
          household?: string | null
          offered_salary_php?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nanny_private: {
        Row: {
          adult_confirmed: boolean
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          privacy_consent_at: string | null
          user_id: string
        }
        Insert: {
          adult_confirmed?: boolean
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          privacy_consent_at?: string | null
          user_id: string
        }
        Update: {
          adult_confirmed?: boolean
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          privacy_consent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nanny_private_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "nanny_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      nanny_profiles: {
        Row: {
          about: string | null
          arrangement: string | null
          available_from: string | null
          badges: string[]
          child_age_groups: string[]
          city: string | null
          created_at: string
          display_name: string
          education: string | null
          expected_salary_php: number | null
          languages: string[]
          photo_path: string | null
          rest_day: string | null
          skills: string[]
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          user_id: string
          verified_at: string | null
          years_experience: number | null
        }
        Insert: {
          about?: string | null
          arrangement?: string | null
          available_from?: string | null
          badges?: string[]
          child_age_groups?: string[]
          city?: string | null
          created_at?: string
          display_name?: string
          education?: string | null
          expected_salary_php?: number | null
          languages?: string[]
          photo_path?: string | null
          rest_day?: string | null
          skills?: string[]
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
          years_experience?: number | null
        }
        Update: {
          about?: string | null
          arrangement?: string | null
          available_from?: string | null
          badges?: string[]
          child_age_groups?: string[]
          city?: string | null
          created_at?: string
          display_name?: string
          education?: string | null
          expected_salary_php?: number | null
          languages?: string[]
          photo_path?: string | null
          rest_day?: string | null
          skills?: string[]
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nanny_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          city: string | null
          created_at: string
          full_name: string
          id: string
          mobile: string | null
          updated_at: string
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"]
          city?: string | null
          created_at?: string
          full_name?: string
          id: string
          mobile?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          mobile?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      work_history: {
        Row: {
          benefits: string[]
          city: string | null
          confirmed: boolean
          created_at: string
          employer_name: string
          ended_on: string | null
          id: string
          leave_reason: string | null
          nanny_id: string
          rating: number | null
          review: string | null
          salary_php: number | null
          started_on: string | null
        }
        Insert: {
          benefits?: string[]
          city?: string | null
          confirmed?: boolean
          created_at?: string
          employer_name: string
          ended_on?: string | null
          id?: string
          leave_reason?: string | null
          nanny_id: string
          rating?: number | null
          review?: string | null
          salary_php?: number | null
          started_on?: string | null
        }
        Update: {
          benefits?: string[]
          city?: string | null
          confirmed?: boolean
          created_at?: string
          employer_name?: string
          ended_on?: string | null
          id?: string
          leave_reason?: string | null
          nanny_id?: string
          rating?: number | null
          review?: string | null
          salary_php?: number | null
          started_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_history_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: false
            referencedRelation: "nanny_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      work_history_contacts: {
        Row: {
          contact: string
          nanny_id: string
          work_history_id: string
        }
        Insert: {
          contact: string
          nanny_id: string
          work_history_id: string
        }
        Update: {
          contact?: string
          nanny_id?: string
          work_history_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_history_contacts_nanny_id_fkey"
            columns: ["nanny_id"]
            isOneToOne: false
            referencedRelation: "nanny_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "work_history_contacts_work_history_id_fkey"
            columns: ["work_history_id"]
            isOneToOne: true
            referencedRelation: "work_history"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_type: "nanny" | "employer"
      document_kind:
        | "profile_photo"
        | "id_live_photo"
        | "government_id"
        | "nbi_clearance"
        | "police_clearance"
        | "barangay_clearance"
        | "tesda_certificate"
        | "first_aid_certificate"
        | "medical_certificate"
        | "other_certificate"
      document_status: "pending" | "approved" | "rejected"
      review_status: "draft" | "pending" | "verified" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      account_type: ["nanny", "employer"],
      document_kind: [
        "profile_photo",
        "id_live_photo",
        "government_id",
        "nbi_clearance",
        "police_clearance",
        "barangay_clearance",
        "tesda_certificate",
        "first_aid_certificate",
        "medical_certificate",
        "other_certificate",
      ],
      document_status: ["pending", "approved", "rejected"],
      review_status: ["draft", "pending", "verified", "rejected"],
    },
  },
} as const
