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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          actor_name: string | null
          body: string | null
          contact_id: string | null
          deal_id: string | null
          id: string
          occurred_at: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          actor_name?: string | null
          body?: string | null
          contact_id?: string | null
          deal_id?: string | null
          id?: string
          occurred_at?: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          actor_name?: string | null
          body?: string | null
          contact_id?: string | null
          deal_id?: string | null
          id?: string
          occurred_at?: string
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          agent_name: string | null
          contact_id: string | null
          direction: string | null
          disposition: Database["public"]["Enums"]["call_disposition"] | null
          duration_sec: number | null
          ended_at: string | null
          id: string
          notes: string | null
          recording_url: string | null
          started_at: string
        }
        Insert: {
          agent_name?: string | null
          contact_id?: string | null
          direction?: string | null
          disposition?: Database["public"]["Enums"]["call_disposition"] | null
          duration_sec?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          recording_url?: string | null
          started_at?: string
        }
        Update: {
          agent_name?: string | null
          contact_id?: string | null
          direction?: string | null
          disposition?: Database["public"]["Enums"]["call_disposition"] | null
          duration_sec?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          recording_url?: string | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          annual_revenue: number | null
          created_at: string
          description: string | null
          domain: string | null
          employees: number | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          tags: string[] | null
          tech_stack: string[] | null
        }
        Insert: {
          annual_revenue?: number | null
          created_at?: string
          description?: string | null
          domain?: string | null
          employees?: number | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          tags?: string[] | null
          tech_stack?: string[] | null
        }
        Update: {
          annual_revenue?: number | null
          created_at?: string
          description?: string | null
          domain?: string | null
          employees?: number | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          tags?: string[] | null
          tech_stack?: string[] | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          annual_revenue: number | null
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_activity_at: string | null
          last_name: string
          lead_source: string | null
          lead_status: Database["public"]["Enums"]["lead_status"] | null
          lifecycle_stage: string | null
          owner_name: string | null
          phone: string | null
          score: number | null
          title: string | null
        }
        Insert: {
          annual_revenue?: number | null
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_activity_at?: string | null
          last_name: string
          lead_source?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          lifecycle_stage?: string | null
          owner_name?: string | null
          phone?: string | null
          score?: number | null
          title?: string | null
        }
        Update: {
          annual_revenue?: number | null
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_activity_at?: string | null
          last_name?: string
          lead_source?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status"] | null
          lifecycle_stage?: string | null
          owner_name?: string | null
          phone?: string | null
          score?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          color_bottom: string | null
          color_top: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          currency: string
          expected_close_date: string | null
          id: string
          owner_name: string | null
          rotting: boolean | null
          sort_order: number | null
          stage: Database["public"]["Enums"]["deal_stage"]
          status: Database["public"]["Enums"]["deal_status"]
          title: string
          value: number
        }
        Insert: {
          color_bottom?: string | null
          color_top?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string
          expected_close_date?: string | null
          id?: string
          owner_name?: string | null
          rotting?: boolean | null
          sort_order?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          status?: Database["public"]["Enums"]["deal_status"]
          title: string
          value?: number
        }
        Update: {
          color_bottom?: string | null
          color_top?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string
          expected_close_date?: string | null
          id?: string
          owner_name?: string | null
          rotting?: boolean | null
          sort_order?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          status?: Database["public"]["Enums"]["deal_status"]
          title?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          contact_id: string | null
          deal_id: string | null
          file_type: string | null
          id: string
          name: string
          size_bytes: number | null
          source: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          contact_id?: string | null
          deal_id?: string | null
          file_type?: string | null
          id?: string
          name: string
          size_bytes?: number | null
          source?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          contact_id?: string | null
          deal_id?: string | null
          file_type?: string | null
          id?: string
          name?: string
          size_bytes?: number | null
          source?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          title: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          title?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          title?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          group_color: string | null
          group_label: string | null
          id: string
          owner_name: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          sort_order: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          group_color?: string | null
          group_label?: string | null
          id?: string
          owner_name?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          group_color?: string | null
          group_label?: string | null
          id?: string
          owner_name?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
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
      activity_type:
        | "lifecycle"
        | "email"
        | "call"
        | "note"
        | "meeting"
        | "task"
        | "form"
        | "video"
        | "sms"
      call_disposition:
        | "no_answer"
        | "voicemail"
        | "contact_not_in"
        | "left_message"
        | "call_back_later"
        | "busy"
        | "not_interested"
        | "connected"
        | "meeting_set"
      deal_stage:
        | "qualified"
        | "contact_made"
        | "demo_scheduled"
        | "proposal_made"
        | "negotiations_started"
      deal_status: "open" | "won" | "lost"
      lead_status: "cold" | "warm" | "hot" | "open" | "closed"
      task_priority: "low" | "medium" | "high"
      task_status: "pending" | "working" | "waiting" | "approved" | "done"
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
      activity_type: [
        "lifecycle",
        "email",
        "call",
        "note",
        "meeting",
        "task",
        "form",
        "video",
        "sms",
      ],
      call_disposition: [
        "no_answer",
        "voicemail",
        "contact_not_in",
        "left_message",
        "call_back_later",
        "busy",
        "not_interested",
        "connected",
        "meeting_set",
      ],
      deal_stage: [
        "qualified",
        "contact_made",
        "demo_scheduled",
        "proposal_made",
        "negotiations_started",
      ],
      deal_status: ["open", "won", "lost"],
      lead_status: ["cold", "warm", "hot", "open", "closed"],
      task_priority: ["low", "medium", "high"],
      task_status: ["pending", "working", "waiting", "approved", "done"],
    },
  },
} as const
