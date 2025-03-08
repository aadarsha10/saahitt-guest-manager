
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Guest, NewGuest } from "@/types/guest";
import { useToast } from "@/components/ui/use-toast";

export function useGuestData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: guests = [], 
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch guests",
        });
        throw error;
      }
      
      return (data || []).map((guest): Guest => ({
        ...guest,
        priority: guest.priority as Guest['priority'],
        status: guest.status as Guest['status'],
        custom_values: guest.custom_values || {},
      }));
    },
    staleTime: 1000, // Set a shorter stale time to refresh data more frequently
  });

  const getGuestById = async (id: string): Promise<Guest> => {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch guest details",
      });
      throw error;
    }

    return {
      ...data,
      priority: data.priority as Guest['priority'],
      status: data.status as Guest['status'],
      custom_values: data.custom_values || {},
    };
  };

  const addGuests = useMutation({
    mutationFn: async (newGuests: NewGuest[]) => {
      const { error } = await supabase
        .from('guests')
        .insert(newGuests);

      if (error) throw error;
      return newGuests;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({
        title: "Success",
        description: "Guests added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add guests",
      });
    },
  });

  const updateGuest = useMutation({
    mutationFn: async (guest: Guest) => {
      const { error } = await supabase
        .from('guests')
        .update(guest)
        .eq('id', guest.id);

      if (error) throw error;
      return guest;
    },
    onSuccess: (updatedGuest) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest', updatedGuest.id] });
      toast({
        title: "Success",
        description: "Guest updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update guest",
      });
    },
  });

  const deleteGuest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest', id] });
      toast({
        title: "Success",
        description: "Guest deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete guest",
      });
    },
  });

  return {
    guests,
    isLoading,
    isFetching,
    error,
    refetch,
    getGuestById,
    addGuests,
    updateGuest,
    deleteGuest,
  };
}
