
import { RsvpStatus } from "@/types/guest";

export const mapStatusToRsvp = (status: string | undefined): RsvpStatus => {
  if (!status) return 'Pending';
  
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'Confirmed';
    case 'maybe':
      return 'Maybe';
    case 'unavailable':
      return 'Unavailable';
    default:
      return 'Pending';
  }
};
