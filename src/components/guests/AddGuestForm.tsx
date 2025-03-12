
import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Upload, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGuestData } from "@/hooks/useGuestData";
import { NewGuest } from "@/types/guest";
import { generateGuestTemplate, parseGuestFile } from "@/utils/excelUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Category } from "@/types/category";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

interface AddGuestFormProps {
  onSuccess: () => void;
}

export default function AddGuestForm({ onSuccess }: AddGuestFormProps) {
  const [guestForms, setGuestForms] = useState<NewGuest[]>([{
    user_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    category: 'Others',
    priority: 'Medium',
    status: 'Pending',
    notes: '',
    custom_values: {},
  }]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  const { addGuests } = useGuestData();

  // Fetch custom categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', session.user.id)
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (index: number, field: keyof NewGuest, value: string) => {
    const updatedForms = [...guestForms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };
    setGuestForms(updatedForms);
  };

  const addGuestForm = () => {
    setGuestForms([...guestForms, {
      user_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      category: 'Others',
      priority: 'Medium',
      status: 'Pending',
      notes: '',
      custom_values: {},
    }]);
  };

  const removeGuestForm = (index: number) => {
    const updatedForms = guestForms.filter((_, i) => i !== index);
    setGuestForms(updatedForms);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setProgress(10);
      const guests = await parseGuestFile(file);
      setProgress(100);
      
      setGuestForms(guests);
      toast({
        title: "File processed successfully",
        description: `${guests.length} guests loaded from file`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error processing file",
        description: error.message,
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      await addGuests.mutateAsync(guestForms);
      
      onSuccess();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper component for field label with tooltip
  const FieldLabel = ({ label, tooltip }: { label: string, tooltip: string }) => (
    <div className="flex items-center space-x-1">
      <span>{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
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
      <DialogTitle className="text-2xl font-bold mb-2">Add Guests</DialogTitle>
      <DialogDescription className="mb-4 text-muted-foreground">
        Add new guests to your event manually or import from a spreadsheet.
      </DialogDescription>
      
      <Tabs defaultValue="manual">
        <TabsList className="mb-4">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="import">Import from File</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <form onSubmit={handleSubmit} className="space-y-6">
            {guestForms.map((guest, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Guest {index + 1}</h3>
                  {guestForms.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeGuestForm(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`first-name-${index}`}>
                      <FieldLabel 
                        label="First Name*" 
                        tooltip="The guest's first name (required)" 
                      />
                    </Label>
                    <Input
                      id={`first-name-${index}`}
                      placeholder="Enter first name"
                      value={guest.first_name}
                      onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`last-name-${index}`}>
                      <FieldLabel 
                        label="Last Name" 
                        tooltip="The guest's last name (optional)" 
                      />
                    </Label>
                    <Input
                      id={`last-name-${index}`}
                      placeholder="Enter last name"
                      value={guest.last_name}
                      onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`email-${index}`}>
                      <FieldLabel 
                        label="Email" 
                        tooltip="Contact email for digital invites and communications" 
                      />
                    </Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      placeholder="example@email.com"
                      value={guest.email}
                      onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`phone-${index}`}>
                      <FieldLabel 
                        label="Phone" 
                        tooltip="Contact phone number for SMS notifications" 
                      />
                    </Label>
                    <Input
                      id={`phone-${index}`}
                      placeholder="+1 (555) 123-4567"
                      value={guest.phone}
                      onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`category-${index}`}>
                      <FieldLabel 
                        label="Category" 
                        tooltip="Group your guests by relationship (Family, Friends, Work, or custom categories)" 
                      />
                    </Label>
                    <Select
                      value={guest.category}
                      onValueChange={(value) => handleInputChange(index, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Family">Family</SelectItem>
                        <SelectItem value="Friends">Friends</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        {/* Map custom categories */}
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
                    <Label htmlFor={`priority-${index}`}>
                      <FieldLabel 
                        label="Priority" 
                        tooltip="Importance level: High (VIPs), Medium (standard guests), Low (optional attendees)" 
                      />
                    </Label>
                    <Select
                      value={guest.priority}
                      onValueChange={(value) => handleInputChange(index, 'priority', value as 'High' | 'Medium' | 'Low')}
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
                    <Label htmlFor={`status-${index}`}>
                      <FieldLabel 
                        label="Status" 
                        tooltip="Attendance status: Confirmed (attending), Maybe (undecided), Unavailable (not attending), Pending (not yet responded)" 
                      />
                    </Label>
                    <Select
                      value={guest.status}
                      onValueChange={(value) => handleInputChange(index, 'status', value as 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending')}
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
                  <Label htmlFor={`notes-${index}`}>
                    <FieldLabel 
                      label="Notes" 
                      tooltip="Additional information about the guest (dietary restrictions, special accommodations, etc.)" 
                    />
                  </Label>
                  <Textarea
                    id={`notes-${index}`}
                    placeholder="Add any special notes, dietary restrictions, etc."
                    value={guest.notes}
                    onChange={(e) => handleInputChange(index, 'notes', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={addGuestForm}
                className="flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Another Guest
              </Button>
              <Button 
                type="submit" 
                className="bg-[#FF6F00] hover:bg-[#FF6F00]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save All Guests"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="import">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={generateGuestTemplate}
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="h-8 w-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">Excel files only (xlsx, xls)</p>
              </label>
            </div>

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-gray-600 text-center">Processing file...</p>
              </div>
            )}

            {guestForms.length > 1 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-[#FF6F00] hover:bg-[#FF6F00]/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Importing..." : `Import ${guestForms.length} Guests`}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
