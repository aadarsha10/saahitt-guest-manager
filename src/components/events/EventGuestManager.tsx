
import { useState } from "react";
import { Guest } from "@/types/guest";
import { EventGuest, InviteMethod } from "@/types/event";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Mail, MessageSquare, Phone, UserCircle, MoreHorizontal } from "lucide-react";

interface EventGuestManagerProps {
  event: { id: string; name: string };
  guests: Guest[];
  eventGuests: Record<string, EventGuest[]>;
  onGuestToggle: (eventId: string, guestId: string) => void;
  onBulkGuestToggle: (eventId: string, guestIds: string[], add: boolean) => void;
  onUpdateInviteStatus: (
    eventId: string,
    guestId: string,
    details: {
      invite_sent: boolean;
      invite_method?: string;
      invite_notes?: string;
    }
  ) => void;
}

const EventGuestManager = ({
  event,
  guests,
  eventGuests,
  onGuestToggle,
  onBulkGuestToggle,
  onUpdateInviteStatus,
}: EventGuestManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInviteMethod, setSelectedInviteMethod] = useState<InviteMethod>("Email");
  const [inviteNotes, setInviteNotes] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const currentEventGuests = eventGuests[event.id] || [];

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = 
      guest.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || guest.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || guest.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-100 text-green-800";
      case "Maybe": return "bg-yellow-100 text-yellow-800";
      case "Unavailable": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Family": return "bg-purple-100 text-purple-800";
      case "Friends": return "bg-blue-100 text-blue-800";
      case "Work": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSelectAll = () => {
    const filteredGuestIds = filteredGuests.map(guest => guest.id);
    onBulkGuestToggle(event.id, filteredGuestIds, true);
  };

  const handleDeselectAll = () => {
    const filteredGuestIds = filteredGuests.map(guest => guest.id);
    onBulkGuestToggle(event.id, filteredGuestIds, false);
  };

  const getInviteMethodIcon = (method: InviteMethod) => {
    switch (method) {
      case "Email": return <Mail className="h-4 w-4" />;
      case "WhatsApp": return <MessageSquare className="h-4 w-4" />;
      case "Phone": return <Phone className="h-4 w-4" />;
      case "In Person": return <UserCircle className="h-4 w-4" />;
      default: return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const handleInviteStatusUpdate = (guestId: string) => {
    onUpdateInviteStatus(event.id, guestId, {
      invite_sent: true,
      invite_method: selectedInviteMethod,
      invite_notes: inviteNotes,
    });
    setSelectedGuestId(null);
    setInviteNotes("");
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Manage Guests for {event.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Select guests to invite to this event
          </p>
        </div>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friends">Friends</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Maybe">Maybe</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex space-x-4">
            <Button variant="outline" onClick={handleSelectAll}>
              Select All Filtered
            </Button>
            <Button variant="outline" onClick={handleDeselectAll}>
              Deselect All Filtered
            </Button>
          </div>

          {/* Guest List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredGuests.map((guest) => {
              const eventGuest = currentEventGuests.find(eg => eg.guest_id === guest.id);
              return (
                <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`guest-${guest.id}`}
                      checked={eventGuest !== undefined}
                      onCheckedChange={() => onGuestToggle(event.id, guest.id)}
                    />
                    <div>
                      <label
                        htmlFor={`guest-${guest.id}`}
                        className="text-sm font-medium leading-none"
                      >
                        {guest.first_name} {guest.last_name}
                      </label>
                      {guest.email && (
                        <p className="text-sm text-gray-500">{guest.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(guest.category)}>
                      {guest.category}
                    </Badge>
                    <Badge className={getStatusColor(guest.status)}>
                      {guest.status}
                    </Badge>
                    {eventGuest && (
                      <>
                        {eventGuest.invite_sent ? (
                          <Badge variant="outline" className="bg-green-50">
                            {getInviteMethodIcon(eventGuest.invite_method as InviteMethod)}
                            <span className="ml-1">Invite Sent</span>
                          </Badge>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedGuestId(guest.id)}
                              >
                                Mark Invite Sent
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Invite Status</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Invite Method</Label>
                                  <Select
                                    value={selectedInviteMethod}
                                    onValueChange={(value) => setSelectedInviteMethod(value as InviteMethod)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Email">Email</SelectItem>
                                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                                      <SelectItem value="Phone">Phone</SelectItem>
                                      <SelectItem value="In Person">In Person</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Notes</Label>
                                  <Textarea
                                    value={inviteNotes}
                                    onChange={(e) => setInviteNotes(e.target.value)}
                                    placeholder="Add any notes about the invitation..."
                                  />
                                </div>
                                <Button
                                  onClick={() => handleInviteStatusUpdate(guest.id)}
                                  className="w-full"
                                >
                                  Update Status
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredGuests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No guests found matching your filters.
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Total Selected: {currentEventGuests.length} guests
            </p>
            <p className="text-sm text-gray-500">
              Invites Sent: {currentEventGuests.filter(eg => eg.invite_sent).length} guests
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EventGuestManager;
