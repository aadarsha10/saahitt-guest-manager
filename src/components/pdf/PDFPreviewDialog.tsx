
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PDFViewer } from "@react-pdf/renderer";
import { GuestListPDF } from "./GuestListPDF";
import { Guest } from "@/types/guest";
import { Event, EventGuest } from "@/types/event";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[800px]">
        <DialogHeader>
          <DialogTitle>Guest List Preview</DialogTitle>
        </DialogHeader>
        <PDFViewer width="100%" height="700px">
          <GuestListPDF guests={guests} event={event} eventGuests={eventGuests} />
        </PDFViewer>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewDialog;
