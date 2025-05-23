export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          front_content: string;
          back_content: string;
          source: "manual" | "ai" | "semi_ai";
          ai_metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          front_content: string;
          back_content: string;
          source?: "manual" | "ai" | "semi_ai";
          ai_metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          front_content?: string;
          back_content?: string;
          source?: "manual" | "ai" | "semi_ai";
          ai_metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcard_reviews: {
        Row: {
          id: string;
          flashcard_id: string;
          quality_response: number;
          easiness_factor: number;
          interval: number;
          repetitions: number;
          next_review_date: string;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          flashcard_id: string;
          quality_response: number;
          easiness_factor?: number;
          interval?: number;
          repetitions?: number;
          next_review_date?: string;
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          flashcard_id?: string;
          quality_response?: number;
          easiness_factor?: number;
          interval?: number;
          repetitions?: number;
          next_review_date?: string;
          reviewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey";
            columns: ["flashcard_id"];
            isOneToOne: false;
            referencedRelation: "flashcards";
            referencedColumns: ["id"];
          },
        ];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          start_time: string;
          end_time: string | null;
          cards_reviewed: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_time?: string;
          end_time?: string | null;
          cards_reviewed?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_time?: string;
          end_time?: string | null;
          cards_reviewed?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "study_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      session_reviews: {
        Row: {
          id: string;
          study_session_id: string;
          flashcard_id: string;
          flashcard_review_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          study_session_id: string;
          flashcard_id: string;
          flashcard_review_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          study_session_id?: string;
          flashcard_id?: string;
          flashcard_review_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_reviews_study_session_id_fkey";
            columns: ["study_session_id"];
            isOneToOne: false;
            referencedRelation: "study_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_reviews_flashcard_id_fkey";
            columns: ["flashcard_id"];
            isOneToOne: false;
            referencedRelation: "flashcards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_reviews_flashcard_review_id_fkey";
            columns: ["flashcard_review_id"];
            isOneToOne: false;
            referencedRelation: "flashcard_reviews";
            referencedColumns: ["id"];
          },
        ];
      };
      system_logs: {
        Row: {
          id: string;
          user_id: string | null;
          error_code: string;
          error_message: string;
          model: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          error_code: string;
          error_message: string;
          model?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          error_code?: string;
          error_message?: string;
          model?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "system_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      flashcard_source: "manual" | "ai" | "semi_ai";
    };
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      flashcard_source: ["manual", "ai", "semi_ai"],
    },
  },
} as const;
