
import { RsvpStatus } from "@/types/guest";

export function mapStatusToRsvp(
  status: "Confirmed" | "Maybe" | "Unavailable" | "Pending"
): RsvpStatus {
  switch (status) {
    case "Confirmed":
      return "accepted";
    case "Maybe":
      return "pending";
    case "Pending":
      return "pending";
    case "Unavailable":
      return "declined";
    default:
      return "pending";
  }
}
