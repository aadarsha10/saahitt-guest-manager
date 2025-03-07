
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
    refetch
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({
        title: "Success",
        description: "Guest updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update guest",
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({
        title: "Success",
        description: "Guest deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete guest",
      });
    },
  });

  return {
    guests,
    isLoading,
    error,
    refetch,
    updateGuest,
    deleteGuest,
  };
}
