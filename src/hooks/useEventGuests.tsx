
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { EventGuest } from "@/types/event";
import { Guest } from "@/types/guest";
import { supabase } from "@/integrations/supabase/client";

export const useEventGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [eventGuests, setEventGuests] = useState<Record<string, EventGuest[]>>({});
  const { toast } = useToast();

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) throw error;
      const typedGuests: Guest[] = data?.map(guest => ({
        ...guest,
        priority: guest.priority as 'High' | 'Medium' | 'Low',
        status: guest.status as 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending'
      })) || [];
      setGuests(typedGuests);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch guests",
      });
    }
  };

  const fetchEventGuests = async () => {
    try {
      const { data, error } = await supabase
        .from("event_guests")
        .select("*");

      if (error) throw error;

      const guestsByEvent: Record<string, EventGuest[]> = {};
      (data || []).forEach((eg: EventGuest) => {
        if (!guestsByEvent[eg.event_id]) {
          guestsByEvent[eg.event_id] = [];
        }
        guestsByEvent[eg.event_id].push(eg);
      });
      setEventGuests(guestsByEvent);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch event guests",
      });
    }
  };

  const handleGuestToggle = async (eventId: string, guestId: string) => {
    const isCurrentlySelected = eventGuests[eventId]?.some(eg => eg.guest_id === guestId);
    
    try {
      if (isCurrentlySelected) {
        const { error } = await supabase
          .from("event_guests")
          .delete()
          .eq("event_id", eventId)
          .eq("guest_id", guestId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_guests")
          .insert({ event_id: eventId, guest_id: guestId });

        if (error) throw error;
      }

      await fetchEventGuests();
      toast({
        title: "Success",
        description: `Guest ${isCurrentlySelected ? "removed from" : "added to"} event`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event guests",
      });
    }
  };

  const handleBulkGuestToggle = async (eventId: string, guestIds: string[], add: boolean) => {
    try {
      if (add) {
        const newEventGuests = guestIds.map(guestId => ({
          event_id: eventId,
          guest_id: guestId
        }));

        const { error } = await supabase
          .from("event_guests")
          .insert(newEventGuests);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("event_guests")
          .delete()
          .eq("event_id", eventId)
          .in("guest_id", guestIds);

        if (error) throw error;
      }

      await fetchEventGuests();
      toast({
        title: "Success",
        description: `${guestIds.length} guests ${add ? "added to" : "removed from"} event`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event guests",
      });
    }
  };

  const updateInviteStatus = async (
    eventId: string, 
    guestId: string, 
    details: {
      invite_sent: boolean;
      invite_method?: string;
      invite_notes?: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from("event_guests")
        .update({
          ...details,
          invite_sent_at: details.invite_sent ? new Date().toISOString() : null
        })
        .eq("event_id", eventId)
        .eq("guest_id", guestId);

      if (error) throw error;

      await fetchEventGuests();
      toast({
        title: "Success",
        description: "Invite status updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update invite status",
      });
    }
  };

  return {
    guests,
    eventGuests,
    fetchGuests,
    fetchEventGuests,
    handleGuestToggle,
    handleBulkGuestToggle,
    updateInviteStatus,
  };
};
