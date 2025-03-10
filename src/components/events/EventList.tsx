
import { useState, useEffect } from "react";
import { Event } from "@/types/event";
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
import { format } from "date-fns";
import { Download } from "lucide-react";
import EventGuestManager from "./EventGuestManager";
import PDFPreviewDialog from "../pdf/PDFPreviewDialog";
import { useEventData } from "@/hooks/useEventData";
import { useEventGuests } from "@/hooks/useEventGuests";

interface EventListProps {
  selectedEventId?: string | null;
}

const EventList = ({ selectedEventId }: EventListProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);
  
  const { events, isLoading, updateEvent, deleteEvent } = useEventData();
  const { guests, eventGuests, fetchGuests, fetchEventGuests, handleGuestToggle, handleBulkGuestToggle, updateInviteStatus } = useEventGuests();

  // Select event if selectedEventId is provided
  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      const event = events.find(e => e.id === selectedEventId);
      if (event) {
        setSelectedEvent(event);
        // Scroll to the event row when component is mounted
        setTimeout(() => {
          const element = document.getElementById(`event-${event.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.classList.add('highlight-event');
            setTimeout(() => element.classList.remove('highlight-event'), 2000);
          }
        }, 100);
      }
    }
  }, [selectedEventId, events]);

  // Fetch guests and event guests on component mount
  useEffect(() => {
    fetchGuests();
    fetchEventGuests();
  }, []);

  const handleDownloadClick = (event: Event) => {
    setPreviewEvent(event);
    setPdfPreviewOpen(true);
  };

  if (isLoading) {
    return <div>Loading events...</div>;
  }

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
              <TableRow key={event.id} id={`event-${event.id}`}>
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
                          onClick={() => {
                            updateEvent.mutate(editingEvent, {
                              onSuccess: () => setEditingEvent(null)
                            });
                          }}
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
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadClick(event)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download List
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            deleteEvent.mutate(event.id, {
                              onSuccess: () => {
                                if (selectedEvent?.id === event.id) {
                                  setSelectedEvent(null);
                                }
                              }
                            });
                          }}
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
        <EventGuestManager
          event={selectedEvent}
          guests={guests}
          eventGuests={eventGuests}
          onGuestToggle={handleGuestToggle}
          onBulkGuestToggle={handleBulkGuestToggle}
          onUpdateInviteStatus={updateInviteStatus}
        />
      )}

      <PDFPreviewDialog
        open={pdfPreviewOpen}
        onOpenChange={setPdfPreviewOpen}
        guests={previewEvent ? guests.filter(g => 
          eventGuests[previewEvent.id]?.some(eg => eg.guest_id === g.id)
        ) : []}
        event={previewEvent || undefined}
        eventGuests={previewEvent ? eventGuests[previewEvent.id] : undefined}
      />
    </div>
  );
};

export default EventList;
