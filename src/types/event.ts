
import { Json } from "@/integrations/supabase/types";

export type Event = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  date?: string;
  created_at: string;
  updated_at: string;
};

export type NewEvent = Omit<Event, 'id' | 'created_at' | 'updated_at'>;

export type EventGuest = {
  id: string;
  event_id: string;
  guest_id: string;
  created_at: string;
};
