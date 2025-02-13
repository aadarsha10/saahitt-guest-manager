
import { useEffect, useState } from "react";
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
import { useEvents } from "@/hooks/useEvents";
import { useEventGuests } from "@/hooks/useEventGuests";
import PDFPreviewDialog from "../pdf/PDFPreviewDialog";

const EventList = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);
  
  const { events, fetchEvents, handleEventUpdate, handleEventDelete } = useEvents();
  const { guests, eventGuests, fetchGuests, fetchEventGuests, handleGuestToggle, handleBulkGuestToggle, updateInviteStatus } = useEventGuests();

  useEffect(() => {
    fetchEvents();
    fetchGuests();
    fetchEventGuests();
  }, []);

  const handleDownloadClick = (event: Event) => {
    setPreviewEvent(event);
    setPdfPreviewOpen(true);
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
                          onClick={() => {
                            handleEventUpdate(editingEvent).then((success) => {
                              if (success) setEditingEvent(null);
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
                            handleEventDelete(event.id).then((success) => {
                              if (success) setSelectedEvent(null);
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
