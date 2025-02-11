
export type Category = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type NewCategory = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
