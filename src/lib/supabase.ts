import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qadtowiaqcsnoebaakov.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZHRvd2lhcWNzbm9lYmFha292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTQzMTQsImV4cCI6MjA3Mjk5MDMxNH0.LnWyjXvEnqU1PaWxAmrW6GSAGGpU2h_NYYob6S4egrE";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          role: "student" | "teacher";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          role: "student" | "teacher";
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          role?: "student" | "teacher";
        };
      };
      games: {
        Row: {
          id: string;
          player1_id: string;
          player2_id: string;
          player1_score: number;
          player2_score: number;
          status: "waiting" | "active" | "completed";
          current_question_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          player1_id: string;
          player2_id?: string;
          player1_score?: number;
          player2_score?: number;
          status?: "waiting" | "active" | "completed";
          current_question_index?: number;
        };
        Update: {
          player1_id?: string;
          player2_id?: string;
          player1_score?: number;
          player2_score?: number;
          status?: "waiting" | "active" | "completed";
          current_question_index?: number;
        };
      };
      game_questions: {
        Row: {
          id: string;
          game_id: string;
          question: string;
          answer: string;
          options: string[];
          correct_answer: string;
          answered_by?: string;
          answered_at?: string;
          created_at: string;
        };
        Insert: {
          game_id: string;
          question: string;
          answer: string;
          options: string[];
          correct_answer: string;
        };
        Update: {
          game_id?: string;
          question?: string;
          answer?: string;
          options?: string[];
          correct_answer?: string;
          answered_by?: string;
          answered_at?: string;
        };
      };
    };
  };
};
