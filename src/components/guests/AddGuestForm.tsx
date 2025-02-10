
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { NewGuest } from "@/types/guest";
import { supabase } from "@/integrations/supabase/client";

const initialGuest: NewGuest = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  category: "Others",
  priority: "Medium",
  status: "Pending",
  notes: "",
};

const AddGuestForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [guest, setGuest] = useState<NewGuest>(initialGuest);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No user found");

      const { error } = await supabase
        .from("guests")
        .insert([{ ...guest, user_id: session.user.id }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Guest added successfully",
      });

      setGuest(initialGuest);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={guest.first_name}
                onChange={(e) => setGuest({ ...guest, first_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={guest.last_name}
                onChange={(e) => setGuest({ ...guest, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={guest.email}
                onChange={(e) => setGuest({ ...guest, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={guest.phone}
                onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={guest.category}
                onValueChange={(value) => setGuest({ ...guest, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friends">Friends</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={guest.priority}
                onValueChange={(value) => setGuest({ ...guest, priority: value as NewGuest['priority'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={guest.status}
                onValueChange={(value) => setGuest({ ...guest, status: value as NewGuest['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Maybe">Maybe</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={guest.notes}
              onChange={(e) => setGuest({ ...guest, notes: e.target.value })}
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setGuest(initialGuest)}
            >
              Clear
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Guest"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddGuestForm;
