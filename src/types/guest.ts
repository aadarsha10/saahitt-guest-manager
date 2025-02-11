
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
  custom_values: Record<string, string | number | Date>;
  created_at: string;
  updated_at: string;
};

export type NewGuest = Omit<Guest, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
