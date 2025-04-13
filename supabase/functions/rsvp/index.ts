
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import * as jose from "https://deno.land/x/jose@v4.15.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RSVPRequest {
  attending: boolean;
  guestsCount?: number;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get token from URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const token = pathSegments[pathSegments.length - 1];
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If this is a GET request, just verify the token and return guest & event data
    if (req.method === "GET") {
      return await handleGetRequest(supabase, token);
    }
    
    // If this is a POST request, update RSVP status
    if (req.method === "POST") {
      const { attending, guestsCount, notes }: RSVPRequest = await req.json();
      return await handlePostRequest(supabase, token, { attending, guestsCount, notes });
    }
    
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleGetRequest(supabase: any, token: string) {
  try {
    // Get token entry from database
    const { data: tokenData, error: tokenError } = await supabase
      .from("rsvp_tokens")
      .select("*")
      .eq("token", token)
      .single();
    
    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Token has expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get guest and event data
    const { data: guest, error: guestError } = await supabase
      .from("guests")
      .select("*")
      .eq("id", tokenData.guest_id)
      .single();
      
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", tokenData.event_id)
      .single();
      
    if (guestError || !guest || eventError || !event) {
      return new Response(
        JSON.stringify({ error: "Could not find guest or event data" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return guest and event data
    return new Response(
      JSON.stringify({ 
        guest: {
          id: guest.id,
          name: `${guest.first_name} ${guest.last_name || ''}`.trim(),
          email: guest.email,
          rsvpStatus: guest.rsvp_status,
          rsvpDetails: guest.rsvp_details
        }, 
        event: {
          id: event.id,
          name: event.name,
          date: event.date,
          description: event.description
        },
        token: token
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error verifying token:", error);
    return new Response(
      JSON.stringify({ error: "Error verifying token" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function handlePostRequest(supabase: any, token: string, { attending, guestsCount, notes }: RSVPRequest) {
  try {
    // Get token entry from database
    const { data: tokenData, error: tokenError } = await supabase
      .from("rsvp_tokens")
      .select("*")
      .eq("token", token)
      .single();
    
    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Token has expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check if token is already used
    if (tokenData.used_at) {
      return new Response(
        JSON.stringify({ 
          error: "RSVP already submitted",
          message: "You have already submitted your RSVP. If you need to make changes, please contact the event organizer."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update guest RSVP status
    const rsvpStatus = attending ? 'accepted' : 'declined';
    const rsvpDetails = {
      guestsCount: attending ? (guestsCount || 1) : 0,
      notes: notes || ''
    };
    
    const { error: updateError } = await supabase
      .from("guests")
      .update({ 
        rsvp_status: rsvpStatus,
        rsvp_at: new Date().toISOString(),
        rsvp_details: rsvpDetails
      })
      .eq("id", tokenData.guest_id);
      
    if (updateError) {
      console.error("Error updating guest RSVP:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update RSVP status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Mark token as used
    const { error: tokenUpdateError } = await supabase
      .from("rsvp_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenData.id);
      
    if (tokenUpdateError) {
      console.error("Error updating token status:", tokenUpdateError);
      // Don't fail the request as the RSVP was updated
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Thank you for your response. Your RSVP has been ${rsvpStatus}.`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing RSVP:", error);
    return new Response(
      JSON.stringify({ error: "Error processing RSVP" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
