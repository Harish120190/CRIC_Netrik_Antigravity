import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create client with anon key to verify the user's token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Authenticated user: ${user.id}`);

    // Use service role for database operations
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...params } = await req.json();
    console.log(`Team operation: ${action}`, params);

    switch (action) {
      case 'getTeamByCode': {
        const { teamCode } = params;
        if (!teamCode) {
          return new Response(JSON.stringify({ error: 'Missing teamCode' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: team, error } = await supabase
          .from('teams')
          .select('*, team_players(*)')
          .eq('team_code', teamCode.toUpperCase())
          .single();

        if (error || !team) {
          return new Response(JSON.stringify({ error: 'Team not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ team }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'joinTeam': {
        const { teamId, userId, mobileNumber, playerName } = params;
        
        if (!teamId || !userId || !mobileNumber || !playerName) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Validate that authenticated user matches the userId being used
        if (user.id !== userId) {
          console.error(`User ${user.id} attempted to join team as ${userId}`);
          return new Response(JSON.stringify({ error: 'Unauthorized: Cannot join team as another user' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if player already exists in team
        const { data: existingPlayer } = await supabase
          .from('team_players')
          .select('*')
          .eq('team_id', teamId)
          .eq('mobile_number', mobileNumber)
          .single();

        if (existingPlayer) {
          // Update existing player to joined
          const { error: updateError } = await supabase
            .from('team_players')
            .update({ 
              user_id: userId, 
              status: 'joined',
              joined_at: new Date().toISOString()
            })
            .eq('id', existingPlayer.id);

          if (updateError) {
            console.error('Error updating player:', updateError);
            return new Response(JSON.stringify({ error: 'Failed to join team' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ success: true, message: 'Joined team successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create new player entry
        const { error: insertError } = await supabase
          .from('team_players')
          .insert({
            team_id: teamId,
            user_id: userId,
            mobile_number: mobileNumber,
            player_name: playerName,
            status: 'joined',
            role: 'player',
            joined_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting player:', insertError);
          return new Response(JSON.stringify({ error: 'Failed to join team' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, message: 'Joined team successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'getInvitedTeams': {
        const { mobileNumber } = params;
        
        if (!mobileNumber) {
          return new Response(JSON.stringify({ error: 'Missing mobileNumber' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Validate that the mobile number belongs to the authenticated user
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('mobile_number')
          .eq('id', user.id)
          .single();

        if (!userProfile || userProfile.mobile_number !== mobileNumber) {
          console.error(`User ${user.id} attempted to get invites for ${mobileNumber}`);
          return new Response(JSON.stringify({ error: 'Unauthorized: Cannot query invites for another user' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: invites, error } = await supabase
          .from('team_players')
          .select('*, teams(*)')
          .eq('mobile_number', mobileNumber)
          .in('status', ['invited', 'pending']);

        if (error) {
          console.error('Error fetching invites:', error);
          return new Response(JSON.stringify({ error: 'Failed to fetch invites' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ invites }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: unknown) {
    console.error('Error in team-operations:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});