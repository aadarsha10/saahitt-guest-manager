
import * as XLSX from 'xlsx';
import { NewGuest } from '@/types/guest';

export const generateGuestTemplate = () => {
  const headers = [
    'First Name*',
    'Last Name',
    'Email',
    'Phone',
    'Category',
    'Priority',
    'Status',
    'Notes'
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');
  
  // Generate and download the file
  XLSX.writeFile(workbook, 'guest_template.xlsx');
};

export const parseGuestFile = async (file: File): Promise<NewGuest[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  return data.map(row => ({
    user_id: '', // Will be set by the component
    first_name: row['First Name*'] || '',
    last_name: row['Last Name'] || '',
    email: row['Email'] || '',
    phone: row['Phone'] || '',
    category: row['Category'] || 'Others',
    priority: (row['Priority'] || 'Medium') as 'High' | 'Medium' | 'Low',
    status: (row['Status'] || 'Pending') as 'Confirmed' | 'Maybe' | 'Unavailable' | 'Pending',
    notes: row['Notes'] || '',
    custom_values: {}
  }));
};
