
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NewGuest } from "@/types/guest";
import { CustomField } from "@/types/custom-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useGuestData } from "@/hooks/useGuestData";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

interface AddGuestFormProps {
  onSuccess: () => void;
}

const AddGuestForm = ({ onSuccess }: AddGuestFormProps) => {
  const [guestForm, setGuestForm] = useState<Partial<NewGuest>>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    category: "Others",
    priority: "Medium",
    status: "Pending",
    notes: "",
    custom_values: {},
  });
  
  const { toast } = useToast();
  const { addGuests } = useGuestData();
  const { categories } = useCategories();
  
  // Fetch custom fields
  const { data: customFields = [] } = useQuery({
    queryKey: ["customFields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_fields")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch custom fields",
        });
        throw error;
      }

      return (
        data?.map((field) => ({
          ...field,
          field_type: field.field_type as CustomField["field_type"],
          options: (field.options as string[]) || [],
        })) || []
      );
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setGuestForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomValueChange = (field: string, value: string) => {
    setGuestForm((prev) => {
      if (!prev) return {};
      
      // Fix: Ensure custom_values is an object before spreading
      const customValues = prev.custom_values || {};
      
      return {
        ...prev,
        custom_values: {
          ...customValues,
          [field]: value,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated user");

      if (!guestForm.first_name) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "First name is required",
        });
        return;
      }

      const newGuest: NewGuest = {
        user_id: session.user.id,
        first_name: guestForm.first_name || "",
        last_name: guestForm.last_name || "",
        email: guestForm.email || "",
        phone: guestForm.phone || "",
        category: guestForm.category || "Others",
        priority: (guestForm.priority || "Medium") as "High" | "Medium" | "Low",
        status: (guestForm.status || "Pending") as "Confirmed" | "Maybe" | "Unavailable" | "Pending",
        notes: guestForm.notes || "",
        custom_values: guestForm.custom_values || {},
      };

      addGuests.mutate([newGuest], {
        onSuccess: onSuccess,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  // Helper component for field label with tooltip
  const FieldLabel = ({ label, tooltip }: { label: string, tooltip: string }) => (
    <div className="flex items-center space-x-1">
      <span>{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add New Guest</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              <FieldLabel
                label="First Name"
                tooltip="The guest's first name (required)"
              />
            </Label>
            <Input
              id="first_name"
              value={guestForm.first_name || ""}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">
              <FieldLabel
                label="Last Name"
                tooltip="The guest's last name (optional)"
              />
            </Label>
            <Input
              id="last_name"
              value={guestForm.last_name || ""}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              <FieldLabel
                label="Email"
                tooltip="Contact email for digital invites"
              />
            </Label>
            <Input
              id="email"
              type="email"
              value={guestForm.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              <FieldLabel
                label="Phone"
                tooltip="Contact phone number"
              />
            </Label>
            <Input
              id="phone"
              value={guestForm.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">
              <FieldLabel
                label="Category"
                tooltip="Guest relationship type (family, friends, work, etc.)"
              />
            </Label>
            <Select
              value={guestForm.category || "Others"}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Friends">Friends</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                {/* Display custom categories */}
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">
              <FieldLabel
                label="Priority"
                tooltip="Importance level: High (VIPs), Medium (standard), Low (optional)"
              />
            </Label>
            <Select
              value={guestForm.priority || "Medium"}
              onValueChange={(value) =>
                handleInputChange("priority", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High (VIP)</SelectItem>
                <SelectItem value="Medium">Medium (Standard)</SelectItem>
                <SelectItem value="Low">Low (Optional)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">
              <FieldLabel
                label="Status"
                tooltip="Attendance status: Confirmed, Maybe, Unavailable, or Pending"
              />
            </Label>
            <Select
              value={guestForm.status || "Pending"}
              onValueChange={(value) =>
                handleInputChange("status", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Confirmed">Confirmed (Attending)</SelectItem>
                <SelectItem value="Maybe">Maybe (Undecided)</SelectItem>
                <SelectItem value="Unavailable">Unavailable (Not Attending)</SelectItem>
                <SelectItem value="Pending">Pending (No Response)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">
            <FieldLabel
              label="Notes"
              tooltip="Additional information, special requests, dietary requirements, etc."
            />
          </Label>
          <Textarea
            id="notes"
            placeholder="Add any notes, special requirements, dietary restrictions, etc."
            value={guestForm.notes || ""}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            rows={3}
          />
        </div>

        {/* Custom Fields Section */}
        {customFields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-medium">Custom Fields</h3>
            <div className="grid grid-cols-2 gap-4">
              {customFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={`custom-${field.id}`}>
                    <FieldLabel
                      label={field.name}
                      tooltip={`Custom field: ${field.name} (${field.field_type})`}
                    />
                  </Label>
                  {field.field_type === "text" && (
                    <Input
                      id={`custom-${field.id}`}
                      value={guestForm.custom_values?.[field.name] || ""}
                      onChange={(e) => handleCustomValueChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.name}`}
                    />
                  )}
                  {field.field_type === "number" && (
                    <Input
                      id={`custom-${field.id}`}
                      type="number"
                      value={guestForm.custom_values?.[field.name] || ""}
                      onChange={(e) => handleCustomValueChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.name}`}
                    />
                  )}
                  {field.field_type === "date" && (
                    <Input
                      id={`custom-${field.id}`}
                      type="date"
                      value={guestForm.custom_values?.[field.name] || ""}
                      onChange={(e) => handleCustomValueChange(field.name, e.target.value)}
                    />
                  )}
                  {field.field_type === "select" && (
                    <Select
                      value={guestForm.custom_values?.[field.name] || ""}
                      onValueChange={(value) => handleCustomValueChange(field.name, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">Add Guest</Button>
      </form>
    </div>
  );
};

export default AddGuestForm;
