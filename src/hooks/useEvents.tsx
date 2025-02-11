
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Event } from "@/types/event";
import { supabase } from "@/integrations/supabase/client";

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch events",
      });
    }
  };

  const handleEventUpdate = async (event: Event) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({
          name: event.name,
          description: event.description,
          date: event.date,
        })
        .eq("id", event.id);

      if (error) throw error;

      fetchEvents();
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event",
      });
      return false;
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      fetchEvents();
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
      return false;
    }
  };

  return {
    events,
    fetchEvents,
    handleEventUpdate,
    handleEventDelete,
  };
};
