
import { useState } from "react";
import { Guest } from "@/types/guest";
import { CustomField } from "@/types/custom-field";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, RefreshCw } from "lucide-react";
import PDFPreviewDialog from "../pdf/PDFPreviewDialog";
import { useToast } from "@/components/ui/use-toast";
import { useGuestData } from "@/hooks/useGuestData";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const { toast } = useToast();
  const { guests, isLoading, isFetching, refetch } = useGuestData();

  const { data: customFields = [], isLoading: isLoadingFields } = useQuery({
    queryKey: ['customFields'],
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

      return data?.map(field => ({
        ...field,
        field_type: field.field_type as CustomField['field_type'],
        options: field.options as string[] || []
      })) || [];
    }
  });

  const handleFilterChange = (field: string, value: string) => {
    if (value === "all") {
      const newFilters = { ...filters };
      delete newFilters[field];
      setFilters(newFilters);
    } else {
      setFilters(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const filteredGuests = guests.filter(guest => {
    return Object.entries(filters).every(([field, value]) => {
      if (!value || value === "all") return true;
      
      if (field === 'category' || field === 'priority' || field === 'status') {
        return guest[field] === value;
      }
      
      const customValue = guest.custom_values?.[field];
      return customValue === value;
    });
  });

  const loading = isLoading || isLoadingFields;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-4 gap-4 flex-1">
          <div className="space-y-2">
            <Label>Category</Label>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.category || "all"}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Friends">Friends</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.priority || "all"}
                onValueChange={(value) => handleFilterChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Maybe">Maybe</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {!loading && customFields.map(field => (
            <div key={field.id} className="space-y-2">
              <Label>{field.name}</Label>
              {field.field_type === 'select' ? (
                <Select
                  value={filters[field.name] || "all"}
                  onValueChange={(value) => handleFilterChange(field.name, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`All ${field.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{`All ${field.name}`}</SelectItem>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex space-x-2 ml-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            onClick={() => setPdfPreviewOpen(true)}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-1" />
            Download List
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              {customFields.map(field => (
                <TableHead key={field.id}>{field.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  {customFields.map(field => (
                    <TableCell key={field.id}><Skeleton className="h-5 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredGuests.length > 0 ? (
              filteredGuests.map((guest) => (
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
                  {customFields.map(field => (
                    <TableCell key={field.id}>
                      {String(guest.custom_values[field.name] || '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={5 + customFields.length} 
                  className="text-center py-8"
                >
                  No guests found matching the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PDFPreviewDialog
        open={pdfPreviewOpen}
        onOpenChange={setPdfPreviewOpen}
        guests={filteredGuests}
      />
    </div>
  );
};

export default GuestList;
