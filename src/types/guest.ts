
export type RsvpStatus = 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending';

export interface Guest {
  id: string;
  user_id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  category?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending';
  notes?: string;
  created_at: string;
  updated_at: string;
  custom_values?: Record<string, any> | null;
  invited_at?: string;
  rsvp_at?: string;
  rsvp_details?: Record<string, any> | null;
  rsvp_status: RsvpStatus;
}
