
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('user_id', session.user.id)
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
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("User not authenticated");
        }
        
        // For free plan users, check guest limits
        // Only check existing guest count without querying profiles
        const { count, error: countError } = await supabase
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);
            
        if (countError) throw countError;
          
        const currentCount = count || 0;
        const totalAfterAdd = currentCount + newGuests.length;
          
        // Apply 100 guest limit regardless of profile availability
        if (totalAfterAdd > 100) {
          throw new Error(`Free plan is limited to 100 guests. You currently have ${currentCount} guests. Please upgrade to add more.`);
        }
        
        // Prepare guests with user_id
        const guestsWithUserId = newGuests.map(guest => ({
          ...guest,
          user_id: session.user.id,
        }));
        
        // Insert guests
        const { error } = await supabase
          .from('guests')
          .insert(guestsWithUserId);
          
        if (error) throw error;
        
        return guestsWithUserId;
      } catch (error: any) {
        console.error("Error adding guests:", error);
        throw error;
      }
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
