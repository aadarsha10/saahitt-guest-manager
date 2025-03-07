
import { useState } from "react";
import { PlusCircle, Trash2, Upload, Download } from "lucide-react";
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
import { NewGuest } from "@/types/guest";
import { generateGuestTemplate, parseGuestFile } from "@/utils/excelUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      setProgress(50);

      // Get current guest count
      const { data: currentGuests, error: countError } = await supabase
        .from('guests')
        .select('id');

      if (countError) throw countError;

      const currentCount = currentGuests?.length || 0;
      const totalAfterImport = currentCount + guests.length;

      // Check plan limits
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type')
        .single();

      if (profile?.plan_type === 'free' && totalAfterImport > 100) {
        throw new Error(`Free plan is limited to 100 guests. You currently have ${currentCount} guests. Please upgrade to add more.`);
      }

      setGuestForms(guests);
      setProgress(100);
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
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Get current guest count
      const { data: currentGuests, error: countError } = await supabase
        .from('guests')
        .select('id');

      if (countError) throw countError;

      const currentCount = currentGuests?.length || 0;
      const totalAfterAdd = currentCount + guestForms.length;

      // Check plan limits
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type')
        .single();

      if (profile?.plan_type === 'free' && totalAfterAdd > 100) {
        throw new Error(`Free plan is limited to 100 guests. You currently have ${currentCount} guests. Please upgrade to add more.`);
      }

      const guestsWithUserId = guestForms.map(guest => ({
        ...guest,
        user_id: session.session.user.id,
      }));

      const { error } = await supabase
        .from("guests")
        .insert(guestsWithUserId);

      if (error) throw error;

      // Invalidate guests query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      
      toast({
        title: "Success",
        description: `${guestForms.length} guest(s) added successfully`,
      });
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
                    <Input
                      placeholder="First Name*"
                      value={guest.first_name}
                      onChange={(e) => handleInputChange(index, 'first_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Last Name"
                      value={guest.last_name}
                      onChange={(e) => handleInputChange(index, 'last_name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={guest.email}
                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={guest.phone}
                    onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Select
                    value={guest.category}
                    onValueChange={(value) => handleInputChange(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Friends">Friends</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={guest.priority}
                    onValueChange={(value) => handleInputChange(index, 'priority', value as 'High' | 'Medium' | 'Low')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={guest.status}
                    onValueChange={(value) => handleInputChange(index, 'status', value as 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Maybe">Maybe</SelectItem>
                      <SelectItem value="Unavailable">Unavailable</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  placeholder="Notes"
                  value={guest.notes}
                  onChange={(e) => handleInputChange(index, 'notes', e.target.value)}
                />
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
