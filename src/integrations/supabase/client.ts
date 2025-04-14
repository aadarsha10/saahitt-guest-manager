
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wifcukhtssicphdfrtex.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZmN1a2h0c3NpY3BoZGZydGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MTk5NDYsImV4cCI6MjA1NDQ5NTk0Nn0.Bnjw3wqk2rsJL1D1sr3sm8QRSkFPKoyxWM2Y7eRisCI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'saahitt-guest-manager-session'
    }
  }
);
