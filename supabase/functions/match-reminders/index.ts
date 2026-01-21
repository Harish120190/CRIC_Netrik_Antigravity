import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Match {
  id: string;
  team1_name: string;
  team2_name: string;
  venue: string;
  match_date: string;
  tournament_id: string | null;
}

interface TeamPlayer {
  user_id: string;
  team_id: string;
  player_name: string;
}

interface Team {
  id: string;
  name: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting match reminder check...");

    // Get matches happening in the next 1-2 hours that haven't been reminded yet
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Fetch upcoming matches
    const { data: upcomingMatches, error: matchError } = await supabase
      .from("matches")
      .select("id, team1_name, team2_name, venue, match_date, tournament_id")
      .eq("status", "upcoming")
      .gte("match_date", oneHourFromNow.toISOString())
      .lte("match_date", twoHoursFromNow.toISOString());

    if (matchError) {
      console.error("Error fetching matches:", matchError);
      throw matchError;
    }

    console.log(`Found ${upcomingMatches?.length || 0} matches to remind`);

    if (!upcomingMatches || upcomingMatches.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matches to remind", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let notificationCount = 0;

    for (const match of upcomingMatches as Match[]) {
      console.log(`Processing match: ${match.team1_name} vs ${match.team2_name}`);

      // Get teams by name
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("id, name")
        .in("name", [match.team1_name, match.team2_name]);

      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
        continue;
      }

      if (!teams || teams.length === 0) {
        console.log("No teams found for match");
        continue;
      }

      const teamIds = (teams as Team[]).map((t) => t.id);

      // Get players from both teams
      const { data: players, error: playersError } = await supabase
        .from("team_players")
        .select("user_id, team_id, player_name")
        .in("team_id", teamIds)
        .eq("status", "active")
        .not("user_id", "is", null);

      if (playersError) {
        console.error("Error fetching players:", playersError);
        continue;
      }

      if (!players || players.length === 0) {
        console.log("No players found for teams");
        continue;
      }

      console.log(`Found ${players.length} players to notify`);

      // Check for existing notifications to avoid duplicates
      const { data: existingNotifications } = await supabase
        .from("notifications")
        .select("user_id")
        .eq("type", "match_reminder")
        .eq("data->>match_id", match.id);

      const alreadyNotifiedUserIds = new Set(
        (existingNotifications || []).map((n: { user_id: string }) => n.user_id)
      );

      // Create notifications for each player
      const matchDate = new Date(match.match_date);
      const timeUntilMatch = Math.round((matchDate.getTime() - now.getTime()) / (60 * 1000));
      
      const notifications = (players as TeamPlayer[])
        .filter((player) => player.user_id && !alreadyNotifiedUserIds.has(player.user_id))
        .map((player) => {
          const playerTeam = (teams as Team[]).find((t) => t.id === player.team_id);
          const opponentTeam = (teams as Team[]).find((t) => t.id !== player.team_id);
          
          return {
            user_id: player.user_id,
            type: "match_reminder",
            title: "Match Starting Soon! 🏏",
            message: `${playerTeam?.name || match.team1_name} vs ${opponentTeam?.name || match.team2_name} at ${match.venue} in ${timeUntilMatch} minutes`,
            data: {
              match_id: match.id,
              tournament_id: match.tournament_id,
              team1_name: match.team1_name,
              team2_name: match.team2_name,
              venue: match.venue,
              match_date: match.match_date,
            },
            read: false,
          };
        });

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (insertError) {
          console.error("Error inserting notifications:", insertError);
        } else {
          notificationCount += notifications.length;
          console.log(`Created ${notifications.length} notifications for match`);
        }
      }
    }

    console.log(`Total notifications created: ${notificationCount}`);

    return new Response(
      JSON.stringify({ 
        message: "Match reminders processed", 
        matchesProcessed: upcomingMatches.length,
        notificationsCreated: notificationCount 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in match-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
