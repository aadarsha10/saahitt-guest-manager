
import { useState } from "react";
import { Guest } from "@/types/guest";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface EventGuestManagerProps {
  event: { id: string; name: string };
  guests: Guest[];
  eventGuests: Record<string, string[]>;
  onGuestToggle: (eventId: string, guestId: string) => void;
}

const EventGuestManager = ({
  event,
  guests,
  eventGuests,
  onGuestToggle,
}: EventGuestManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

          {/* Guest List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredGuests.map((guest) => (
              <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`guest-${guest.id}`}
                    checked={eventGuests[event.id]?.includes(guest.id)}
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
                </div>
              </div>
            ))}
            {filteredGuests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No guests found matching your filters.
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">
            Total Selected: {eventGuests[event.id]?.length || 0} guests
          </p>
        </div>
      </div>
    </Card>
  );
};

export default EventGuestManager;
