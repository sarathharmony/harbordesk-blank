import { Injectable, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  Booking,
  BookingStatus,
  Client,
  HarborDeskStore,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
} from './storage.types';

const DEFAULT_HOURLY_RATE = 85;
const ROOMS = ['Studio A', 'Studio B', 'Live Room'];

function seedStore(): HarborDeskStore {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(17, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 5);
  nextWeek.setHours(10, 0, 0, 0);
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(13, 0, 0, 0);

  const clients: Client[] = [
    {
      id: randomUUID(),
      name: 'Maya Chen',
      email: 'maya@nightshift.audio',
      phone: '(415) 555-0142',
      notes: 'Prefers Studio A. Brings own engineer.',
      createdAt: now.toISOString(),
    },
    {
      id: randomUUID(),
      name: 'Jordan Blake',
      email: 'jordan@blakephotos.com',
      phone: '(510) 555-0198',
      notes: 'Portrait sessions, natural light setup.',
      createdAt: now.toISOString(),
    },
    {
      id: randomUUID(),
      name: 'The Velvet Hours',
      email: 'booking@velvethours.band',
      phone: '(628) 555-0103',
      notes: 'Indie band — recurring monthly sessions.',
      createdAt: now.toISOString(),
    },
  ];

  const bookings: Booking[] = [
    {
      id: randomUUID(),
      clientId: clients[0].id,
      start: tomorrow.toISOString(),
      end: tomorrowEnd.toISOString(),
      room: ROOMS[0],
      status: 'confirmed',
      hourlyRate: DEFAULT_HOURLY_RATE,
      createdAt: now.toISOString(),
    },
    {
      id: randomUUID(),
      clientId: clients[1].id,
      start: nextWeek.toISOString(),
      end: nextWeekEnd.toISOString(),
      room: ROOMS[1],
      status: 'held',
      hourlyRate: 120,
      createdAt: now.toISOString(),
    },
  ];

  return { clients, bookings, invoices: [] };
}

@Injectable()
export class StorageService implements OnModuleInit {
  private store!: HarborDeskStore;
  private readonly dataPath = join(process.cwd(), 'data', 'harbordesk.json');

  onModuleInit(): void {
    this.load();
  }

  private load(): void {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (existsSync(this.dataPath)) {
      const raw = readFileSync(this.dataPath, 'utf8');
      this.store = JSON.parse(raw) as HarborDeskStore;
      return;
    }

    this.store = seedStore();
    this.persist();
  }

  private persist(): void {
    writeFileSync(this.dataPath, JSON.stringify(this.store, null, 2), 'utf8');
  }

  getRooms(): string[] {
    return ROOMS;
  }

  // --- Clients ---

  findAllClients(): Client[] {
    return [...this.store.clients].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
  }

  findClient(id: string): Client | undefined {
    return this.store.clients.find((c) => c.id === id);
  }

  createClient(data: Omit<Client, 'id' | 'createdAt'>): Client {
    const client: Client = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.store.clients.unshift(client);
    this.persist();
    return client;
  }

  updateClient(
    id: string,
    data: Partial<Omit<Client, 'id' | 'createdAt'>>,
  ): Client | undefined {
    const client = this.findClient(id);
    if (!client) {
      return undefined;
    }
    Object.assign(client, data);
    this.persist();
    return client;
  }

  findClientByEmail(email: string): Client | undefined {
    const normalized = email.trim().toLowerCase();
    return this.store.clients.find(
      (c) => c.email.trim().toLowerCase() === normalized,
    );
  }

  // --- Bookings ---

  findAllBookings(): Booking[] {
    return [...this.store.bookings].sort((a, b) => a.start.localeCompare(b.start));
  }

  findBooking(id: string): Booking | undefined {
    return this.store.bookings.find((b) => b.id === id);
  }

  createBooking(data: {
    clientId: string;
    start: string;
    end: string;
    room: string;
    status: BookingStatus;
    hourlyRate: number;
  }): Booking {
    const booking: Booking = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.store.bookings.push(booking);
    this.persist();
    return booking;
  }

  updateBooking(
    id: string,
    data: Partial<Omit<Booking, 'id' | 'createdAt'>>,
  ): Booking | undefined {
    const booking = this.findBooking(id);
    if (!booking) {
      return undefined;
    }
    Object.assign(booking, data);
    this.persist();
    return booking;
  }

  // --- Invoices ---

  findAllInvoices(): Invoice[] {
    return [...this.store.invoices].sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
  }

  findInvoice(id: string): Invoice | undefined {
    return this.store.invoices.find((i) => i.id === id);
  }

  private computeTotal(lineItems: InvoiceLineItem[]): number {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  }

  createInvoice(data: {
    clientId: string;
    bookingId?: string | null;
    lineItems: InvoiceLineItem[];
    status?: InvoiceStatus;
  }): Invoice {
    const lineItems = data.lineItems.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice,
    }));
    const invoice: Invoice = {
      id: randomUUID(),
      clientId: data.clientId,
      bookingId: data.bookingId ?? null,
      lineItems,
      total: this.computeTotal(lineItems),
      status: data.status ?? 'draft',
      createdAt: new Date().toISOString(),
    };
    this.store.invoices.unshift(invoice);
    this.persist();
    return invoice;
  }

  createInvoiceFromBooking(bookingId: string): Invoice | undefined {
    const booking = this.findBooking(bookingId);
    if (!booking || booking.status !== 'confirmed') {
      return undefined;
    }

    const existing = this.store.invoices.find((i) => i.bookingId === bookingId);
    if (existing) {
      return existing;
    }

    const start = new Date(booking.start);
    const end = new Date(booking.end);
    const hours = Math.max((end.getTime() - start.getTime()) / 3_600_000, 0.5);
    const roundedHours = Math.round(hours * 100) / 100;

    return this.createInvoice({
      clientId: booking.clientId,
      bookingId: booking.id,
      lineItems: [
        {
          description: `${booking.room} session (${roundedHours} hrs @ $${booking.hourlyRate}/hr)`,
          quantity: roundedHours,
          unitPrice: booking.hourlyRate,
          amount: roundedHours * booking.hourlyRate,
        },
      ],
      status: 'draft',
    });
  }

  updateInvoice(
    id: string,
    data: Partial<Pick<Invoice, 'status' | 'lineItems'>>,
  ): Invoice | undefined {
    const invoice = this.findInvoice(id);
    if (!invoice) {
      return undefined;
    }
    if (data.lineItems) {
      invoice.lineItems = data.lineItems.map((item) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      }));
      invoice.total = this.computeTotal(invoice.lineItems);
    }
    if (data.status) {
      invoice.status = data.status;
    }
    this.persist();
    return invoice;
  }

  markInvoicePaid(id: string): Invoice | undefined {
    return this.updateInvoice(id, { status: 'paid' });
  }
}
