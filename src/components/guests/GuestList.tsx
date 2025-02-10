
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
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
import { Badge } from "@/components/ui/badge";

const priorityColors = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const statusColors = {
  Confirmed: "bg-green-100 text-green-800",
  Maybe: "bg-yellow-100 text-yellow-800",
  Unavailable: "bg-red-100 text-red-800",
  Pending: "bg-gray-100 text-gray-800",
};

const GuestList = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Validate and transform the data to ensure it matches the Guest type
      const validGuests = (data || []).map((guest): Guest => ({
        ...guest,
        priority: guest.priority as Guest['priority'],
        status: guest.status as Guest['status'],
      }));
      
      setGuests(validGuests);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch guests",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  if (isLoading) {
    return <div>Loading guests...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>
                {guest.first_name} {guest.last_name}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {guest.email && <div className="text-sm">{guest.email}</div>}
                  {guest.phone && <div className="text-sm">{guest.phone}</div>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{guest.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[guest.priority]}>
                  {guest.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[guest.status]}>
                  {guest.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {guests.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No guests added yet. Start by adding your first guest!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default GuestList;
