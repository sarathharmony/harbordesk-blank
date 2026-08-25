export type BookingStatus = 'held' | 'confirmed' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  start: string;
  end: string;
  room: string;
  status: BookingStatus;
  hourlyRate: number;
  createdAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  bookingId: string | null;
  lineItems: InvoiceLineItem[];
  total: number;
  status: InvoiceStatus;
  createdAt: string;
}

export interface HarborDeskStore {
  clients: Client[];
  bookings: Booking[];
  invoices: Invoice[];
}
