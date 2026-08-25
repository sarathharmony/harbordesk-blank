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

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

// --- Clients ---

export async function fetchClients(): Promise<Client[]> {
  return handle<Client[]>(await fetch('/api/clients'));
}

export async function createClient(data: {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}): Promise<Client> {
  return handle<Client>(
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
}

export async function updateClient(
  id: string,
  data: Partial<{ name: string; email: string; phone: string; notes: string }>,
): Promise<Client> {
  return handle<Client>(
    await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
}

// --- Bookings ---

export async function fetchBookings(): Promise<Booking[]> {
  return handle<Booking[]>(await fetch('/api/bookings'));
}

export async function createBooking(data: {
  clientId: string;
  start: string;
  end: string;
  room: string;
  status?: BookingStatus;
  hourlyRate?: number;
}): Promise<Booking> {
  return handle<Booking>(
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
}

export async function updateBooking(
  id: string,
  data: Partial<{
    clientId: string;
    start: string;
    end: string;
    room: string;
    status: BookingStatus;
    hourlyRate: number;
  }>,
): Promise<Booking> {
  return handle<Booking>(
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
}

// --- Invoices ---

export async function fetchInvoices(): Promise<Invoice[]> {
  return handle<Invoice[]>(await fetch('/api/invoices'));
}

export async function createInvoice(data: {
  clientId: string;
  bookingId?: string;
  lineItems: Omit<InvoiceLineItem, 'amount'>[];
  status?: InvoiceStatus;
}): Promise<Invoice> {
  return handle<Invoice>(
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
}

export async function createInvoiceFromBooking(bookingId: string): Promise<Invoice> {
  return handle<Invoice>(
    await fetch(`/api/invoices/from-booking/${bookingId}`, { method: 'POST' }),
  );
}

export async function markInvoicePaid(id: string): Promise<Invoice> {
  return handle<Invoice>(
    await fetch(`/api/invoices/${id}/mark-paid`, { method: 'POST' }),
  );
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
): Promise<Invoice> {
  return handle<Invoice>(
    await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),
  );
}

// --- Public ---

export async function fetchPublicRooms(): Promise<string[]> {
  return handle<string[]>(await fetch('/api/public/rooms'));
}

export async function fetchPublicAvailability(): Promise<Booking[]> {
  return handle<Booking[]>(await fetch('/api/public/availability'));
}

export async function publicBook(data: {
  name: string;
  email: string;
  start: string;
  end: string;
  room?: string;
}): Promise<Booking> {
  return handle<Booking>(
    await fetch('/api/public/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
}
