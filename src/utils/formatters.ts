import { format } from 'date-fns';

export const formatDate = (date: string | Date | null) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date | null) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatNRC = (nrc: string) => {
  // Assuming NRC is like 123456/78/1
  return nrc;
};

export const formatPhone = (phone: string) => {
  return phone;
};
