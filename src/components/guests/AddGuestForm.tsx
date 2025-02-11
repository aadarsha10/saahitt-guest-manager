
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CustomField } from "@/types/custom-field";
import { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type GuestFormData = {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending';
  notes?: string;
  custom_values: Json;
};

const initialGuest: GuestFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  category: "Others",
  priority: "Medium",
  status: "Pending",
  notes: "",
  custom_values: {},
};

const AddGuestForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [guest, setGuest] = useState<GuestFormData>(initialGuest);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const typedData = data?.map(field => ({
        ...field,
        field_type: field.field_type as CustomField['field_type'],
        options: field.options as string[] || []
      })) || [];

      setCustomFields(typedData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch custom fields",
      });
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setGuest(prev => ({
      ...prev,
      custom_values: {
        ...prev.custom_values as Record<string, unknown>,
        [fieldName]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No user found");

      const guestData = {
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone,
        category: guest.category,
        priority: guest.priority,
        status: guest.status,
        notes: guest.notes,
        user_id: session.user.id,
        custom_values: guest.custom_values || {}
      };

      const { error } = await supabase
        .from("guests")
        .insert(guestData);

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
                onValueChange={(value) => setGuest({ ...guest, priority: value as GuestFormData['priority'] })}
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
                onValueChange={(value) => setGuest({ ...guest, status: value as GuestFormData['status'] })}
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

          {/* Custom Fields Section */}
          {customFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Custom Fields</h3>
              <div className="grid grid-cols-2 gap-4">
                {customFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.name}>{field.name}</Label>
                    {field.field_type === 'select' ? (
                      <Select
                        value={(guest.custom_values[field.name] as string) || ''}
                        onValueChange={(value) => handleCustomFieldChange(field.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.field_type === 'date' ? (
                      <Input
                        type="date"
                        id={field.name}
                        value={(guest.custom_values[field.name] as string) || ''}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      />
                    ) : field.field_type === 'number' ? (
                      <Input
                        type="number"
                        id={field.name}
                        value={(guest.custom_values[field.name] as string) || ''}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      />
                    ) : (
                      <Input
                        type="text"
                        id={field.name}
                        value={(guest.custom_values[field.name] as string) || ''}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
