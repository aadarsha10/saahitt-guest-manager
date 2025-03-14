
import { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Guest } from "@/types/guest";
import { Event, EventGuest } from "@/types/event";
import GuestListPDF from "./GuestListPDF";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { CustomField } from "@/types/custom-field";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guests: Guest[];
  event?: Event;
  eventGuests?: EventGuest[];
}

const PDFPreviewDialog = ({
  open,
  onOpenChange,
  guests,
  event,
  eventGuests,
}: PDFPreviewDialogProps) => {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch custom fields
  const { data: customFields = [] } = useQuery({
    queryKey: ["customFields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_fields")
        .select("*");

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
    enabled: open,
  });

  const handleDownload = async () => {
    const fileName = event ? `guest-list-${event.name}.pdf` : "guest-list.pdf";
    const blob = await pdf(
      <GuestListPDF 
        guests={guests} 
        customFields={customFields}
        event={event}
        eventGuests={eventGuests}
      />
    ).toBlob();
    saveAs(blob, fileName);
  };

  if (!isClient) return null;

  return (
    <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>
          {event ? `Guest List for ${event.name}` : "Guest List Preview"}
        </DialogTitle>
        <DialogDescription>
          Preview and download your guest list as a PDF.
        </DialogDescription>
      </DialogHeader>
      <div className="flex-1 relative mt-4">
        <Button
          variant="outline"
          className="absolute top-2 right-2 z-10"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <PDFViewer
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "0.5rem",
            border: "1px solid #e2e8f0",
          }}
        >
          <GuestListPDF 
            guests={guests} 
            customFields={customFields}
            event={event}
            eventGuests={eventGuests}
          />
        </PDFViewer>
      </div>
    </DialogContent>
  );
};

export default PDFPreviewDialog;
