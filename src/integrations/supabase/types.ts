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
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          threshold: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          threshold?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          threshold?: number | null
        }
        Relationships: []
      }
      balls: {
        Row: {
          id: string
          match_id: string
          innings_no: number
          over_number: number
          ball_number: number
          bowler_id: string | null
          batsman_id: string | null
          non_striker_id: string | null
          bowler_name: string | null
          batsman_name: string | null
          non_striker_name: string | null
          runs_scored: number
          extras_type: string | null
          extras_runs: number
          is_wicket: boolean
          wicket_type: string | null
          player_out_id: string | null
          player_out_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          innings_no: number
          over_number: number
          ball_number: number
          bowler_id?: string | null
          batsman_id?: string | null
          non_striker_id?: string | null
          bowler_name?: string | null
          batsman_name?: string | null
          non_striker_name?: string | null
          runs_scored?: number
          extras_type?: string | null
          extras_runs?: number
          is_wicket?: boolean
          wicket_type?: string | null
          player_out_id?: string | null
          player_out_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          innings_no?: number
          over_number?: number
          ball_number?: number
          bowler_id?: string | null
          batsman_id?: string | null
          non_striker_id?: string | null
          bowler_name?: string | null
          batsman_name?: string | null
          non_striker_name?: string | null
          runs_scored?: number
          extras_type?: string | null
          extras_runs?: number
          is_wicket?: boolean
          wicket_type?: string | null
          player_out_id?: string | null
          player_out_name?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "balls_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "match_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_points: {
        Row: {
          breakdown: Json | null
          created_at: string
          id: string
          match_id: string
          points: number
          user_id: string
        }
        Insert: {
          breakdown?: Json | null
          created_at?: string
          id?: string
          match_id: string
          points?: number
          user_id: string
        }
        Update: {
          breakdown?: Json | null
          created_at?: string
          id?: string
          match_id?: string
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_points_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string | null
          following_team_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id?: string | null
          following_team_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string | null
          following_team_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_team_id_fkey"
            columns: ["following_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      innings: {
        Row: {
          balls: number
          batting_team_name: string
          bowling_team_name: string
          created_at: string
          extras: number
          fours: number
          id: string
          innings_number: number
          match_id: string
          overs: number
          runs: number
          sixes: number
          updated_at: string
          wickets: number
        }
        Insert: {
          balls?: number
          batting_team_name: string
          bowling_team_name: string
          created_at?: string
          extras?: number
          fours?: number
          id?: string
          innings_number: number
          match_id: string
          overs?: number
          runs?: number
          sixes?: number
          updated_at?: string
          wickets?: number
        }
        Update: {
          balls?: number
          batting_team_name?: string
          bowling_team_name?: string
          created_at?: string
          extras?: number
          fours?: number
          id?: string
          innings_number?: number
          match_id?: string
          overs?: number
          runs?: number
          sixes?: number
          updated_at?: string
          wickets?: number
        }
        Relationships: [
          {
            foreignKeyName: "innings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      join_requests: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          match_id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          match_id: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          match_id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_comments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "match_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          match_date: string | null
          result: string | null
          status: string
          team1_name: string
          team2_name: string
          toss_decision: string | null
          toss_winner: string | null
          total_overs: number
          tournament_id: string | null
          updated_at: string
          venue: string
          winner_name: string | null
          match_type: string | null
          ball_type: string | null
          team1_id: string | null
          team2_id: string | null
          ground_id: string | null
          ground_name: string | null
          city: string | null
          umpire_id: string | null
          umpire_name: string | null
          scorer_id: string | null
          scorer_name: string | null
          winning_prize: string | null
          match_fee: string | null
          toss_delayed: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_date?: string | null
          result?: string | null
          status?: string
          team1_name: string
          team2_name: string
          toss_decision?: string | null
          toss_winner?: string | null
          total_overs?: number
          tournament_id?: string | null
          updated_at?: string
          venue?: string
          winner_name?: string | null
          match_type?: string
          ball_type?: string
          team1_id?: string | null
          team2_id?: string | null
          ground_id?: string | null
          ground_name?: string | null
          city?: string | null
          umpire_id?: string | null
          umpire_name?: string | null
          scorer_id?: string | null
          scorer_name?: string | null
          winning_prize?: string | null
          match_fee?: string | null
          toss_delayed?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          match_date?: string | null
          result?: string | null
          status?: string
          team1_name?: string
          team2_name?: string
          toss_decision?: string | null
          toss_winner?: string | null
          total_overs?: number
          tournament_id?: string | null
          updated_at?: string
          venue?: string
          winner_name?: string | null
          match_type?: string
          ball_type?: string
          team1_id?: string | null
          team2_id?: string | null
          ground_id?: string | null
          ground_name?: string | null
          city?: string | null
          umpire_id?: string | null
          umpire_name?: string | null
          scorer_id?: string | null
          scorer_name?: string | null
          winning_prize?: string | null
          match_fee?: string | null
          toss_delayed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      mom_votes: {
        Row: {
          created_at: string
          id: string
          match_id: string
          player_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          player_id: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          player_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mom_votes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mom_votes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mom_votes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mom_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mom_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_logs: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          mobile_number: string
          otp_type: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          mobile_number: string
          otp_type: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          mobile_number?: string
          otp_type?: string
          status?: string | null
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          balls_bowled: number
          balls_faced: number
          best_bowling_runs: number
          best_bowling_wickets: number
          catches: number
          created_at: string
          ducks: number
          fifties: number
          fours: number
          highest_score: number
          hundreds: number
          id: string
          innings: number
          maidens: number
          matches: number
          not_outs: number
          overs_bowled: number
          run_outs: number
          runs: number
          runs_conceded: number
          sixes: number
          stumpings: number
          updated_at: string
          user_id: string | null
          wickets: number
        }
        Insert: {
          balls_bowled?: number
          balls_faced?: number
          best_bowling_runs?: number
          best_bowling_wickets?: number
          catches?: number
          created_at?: string
          ducks?: number
          fifties?: number
          fours?: number
          highest_score?: number
          hundreds?: number
          id?: string
          innings?: number
          maidens?: number
          matches?: number
          not_outs?: number
          overs_bowled?: number
          run_outs?: number
          runs?: number
          runs_conceded?: number
          sixes?: number
          stumpings?: number
          updated_at?: string
          user_id?: string | null
          wickets?: number
        }
        Update: {
          balls_bowled?: number
          balls_faced?: number
          best_bowling_runs?: number
          best_bowling_wickets?: number
          catches?: number
          created_at?: string
          ducks?: number
          fifties?: number
          fours?: number
          highest_score?: number
          hundreds?: number
          id?: string
          innings?: number
          maidens?: number
          matches?: number
          not_outs?: number
          overs_bowled?: number
          run_outs?: number
          runs?: number
          runs_conceded?: number
          sixes?: number
          stumpings?: number
          updated_at?: string
          user_id?: string | null
          wickets?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          mobile_number: string | null
          mobile_verified: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          mobile_number?: string | null
          mobile_verified?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          mobile_number?: string | null
          mobile_verified?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_players: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          mobile_number: string
          player_name: string
          role: Database["public"]["Enums"]["team_role"] | null
          status: Database["public"]["Enums"]["player_status"] | null
          team_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          mobile_number: string
          player_name: string
          role?: Database["public"]["Enums"]["team_role"] | null
          status?: Database["public"]["Enums"]["player_status"] | null
          team_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          mobile_number?: string
          player_name?: string
          role?: Database["public"]["Enums"]["team_role"] | null
          status?: Database["public"]["Enums"]["player_status"] | null
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_players_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          qr_code_url: string | null
          team_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          qr_code_url?: string | null
          team_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          qr_code_url?: string | null
          team_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_invites: {
        Row: {
          created_at: string
          id: string
          invited_by: string
          message: string | null
          responded_at: string | null
          status: string
          team_id: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by: string
          message?: string | null
          responded_at?: string | null
          status?: string
          team_id: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string
          message?: string | null
          responded_at?: string | null
          status?: string
          team_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_invites_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_invites_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_registrations: {
        Row: {
          created_at: string
          id: string
          message: string | null
          requested_by: string
          responded_at: string | null
          response_message: string | null
          status: string
          team_id: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          requested_by: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          team_id: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          requested_by?: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          team_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_teams: {
        Row: {
          created_at: string
          group_name: string | null
          id: string
          matches_lost: number
          matches_played: number
          matches_tied: number
          matches_won: number
          net_run_rate: number | null
          points: number
          seed: number | null
          status: string
          team_id: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          group_name?: string | null
          id?: string
          matches_lost?: number
          matches_played?: number
          matches_tied?: number
          matches_won?: number
          net_run_rate?: number | null
          points?: number
          seed?: number | null
          status?: string
          team_id: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          group_name?: string | null
          id?: string
          matches_lost?: number
          matches_played?: number
          matches_tied?: number
          matches_won?: number
          net_run_rate?: number | null
          points?: number
          seed?: number | null
          status?: string
          team_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          banner_url: string | null
          created_at: string
          end_date: string | null
          entry_fee: number | null
          format: string
          id: string
          max_teams: number | null
          name: string
          organizer_id: string | null
          overs: number
          prize_pool: string | null
          rules: string | null
          start_date: string
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          end_date?: string | null
          entry_fee?: number | null
          format?: string
          id?: string
          max_teams?: number | null
          name: string
          organizer_id?: string | null
          overs?: number
          prize_pool?: string | null
          rules?: string | null
          start_date: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          end_date?: string | null
          entry_fee?: number | null
          format?: string
          id?: string
          max_teams?: number | null
          name?: string
          organizer_id?: string | null
          overs?: number
          prize_pool?: string | null
          rules?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          match_id: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          match_id?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          match_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_team_code: { Args: never; Returns: string }
    }
    Enums: {
      player_status: "invited" | "pending" | "joined"
      team_role: "admin" | "captain" | "player"
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
      player_status: ["invited", "pending", "joined"],
      team_role: ["admin", "captain", "player"],
    },
  },
} as const
