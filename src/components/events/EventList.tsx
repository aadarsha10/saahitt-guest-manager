
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Event, EventGuest } from "@/types/event";
import { Guest } from "@/types/guest";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

const EventList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [eventGuests, setEventGuests] = useState<Record<string, string[]>>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchGuests();
    fetchEventGuests();
  }, []);

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

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) throw error;
      setGuests(data || []);
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

      const guestsByEvent: Record<string, string[]> = {};
      (data || []).forEach((eg: EventGuest) => {
        if (!guestsByEvent[eg.event_id]) {
          guestsByEvent[eg.event_id] = [];
        }
        guestsByEvent[eg.event_id].push(eg.guest_id);
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
    const isCurrentlySelected = eventGuests[eventId]?.includes(guestId);
    
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

      setEditingEvent(null);
      fetchEvents();
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event",
      });
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
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  {editingEvent?.id === event.id ? (
                    <Input
                      value={editingEvent.name}
                      onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                    />
                  ) : (
                    event.name
                  )}
                </TableCell>
                <TableCell>
                  {editingEvent?.id === event.id ? (
                    <Input
                      type="datetime-local"
                      value={editingEvent.date}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    />
                  ) : (
                    event.date ? format(new Date(event.date), "PPp") : "No date set"
                  )}
                </TableCell>
                <TableCell>
                  {editingEvent?.id === event.id ? (
                    <Textarea
                      value={editingEvent.description || ""}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    />
                  ) : (
                    event.description || "No description"
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-x-2">
                    {editingEvent?.id === event.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEventUpdate(editingEvent)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEvent(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEvent(event)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                        >
                          Manage Guests
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEventDelete(event.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No events found. Add your first event to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedEvent && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Manage Guests for {selectedEvent.name}</h3>
          <div className="space-y-4">
            {guests.map((guest) => (
              <div key={guest.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`guest-${guest.id}`}
                  checked={eventGuests[selectedEvent.id]?.includes(guest.id)}
                  onCheckedChange={() => handleGuestToggle(selectedEvent.id, guest.id)}
                />
                <label htmlFor={`guest-${guest.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {guest.first_name} {guest.last_name}
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default EventList;
