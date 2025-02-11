
import { Json } from "@/integrations/supabase/types";

export type Guest = {
  id: string;
  user_id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending';
  notes?: string;
  custom_values: Json;
  created_at: string;
  updated_at: string;
};

export type NewGuest = Omit<Guest, 'id' | 'created_at' | 'updated_at'>;

