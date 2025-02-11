
import { Guest } from "@/types/guest";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

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
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Manage Guests for {event.name}</h3>
      <div className="space-y-4">
        {guests.map((guest) => (
          <div key={guest.id} className="flex items-center space-x-2">
            <Checkbox
              id={`guest-${guest.id}`}
              checked={eventGuests[event.id]?.includes(guest.id)}
              onCheckedChange={() => onGuestToggle(event.id, guest.id)}
            />
            <label
              htmlFor={`guest-${guest.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {guest.first_name} {guest.last_name}
            </label>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EventGuestManager;
