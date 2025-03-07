
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";
import { useToast } from "@/components/ui/use-toast";

export function useEventData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: events = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch events",
        });
        throw error;
      }
      
      return data || [];
    },
  });

  const addEvent = useMutation({
    mutationFn: async (newEvent: Omit<Event, 'id'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert(newEvent)
        .select();

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event added successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add event",
      });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async (event: Event) => {
      const { error } = await supabase
        .from('events')
        .update({
          name: event.name,
          description: event.description,
          date: event.date,
        })
        .eq('id', event.id);

      if (error) throw error;
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event",
      });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
    },
  });

  return {
    events,
    isLoading,
    error,
    refetch,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
