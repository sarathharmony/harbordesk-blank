import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Invoice } from '../storage/storage.types';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly storage: StorageService) {}

  findAll(): Invoice[] {
    return this.storage.findAllInvoices();
  }

  findOne(id: string): Invoice {
    const invoice = this.storage.findInvoice(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }

  create(dto: CreateInvoiceDto): Invoice {
    if (!this.storage.findClient(dto.clientId)) {
      throw new NotFoundException(`Client ${dto.clientId} not found`);
    }
    if (dto.bookingId && !this.storage.findBooking(dto.bookingId)) {
      throw new NotFoundException(`Booking ${dto.bookingId} not found`);
    }
    if (dto.lineItems.length === 0) {
      throw new BadRequestException('At least one line item is required');
    }
    return this.storage.createInvoice({
      clientId: dto.clientId,
      bookingId: dto.bookingId ?? null,
      lineItems: dto.lineItems.map((item) => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice,
      })),
      status: dto.status,
    });
  }

  createFromBooking(bookingId: string): Invoice {
    const invoice = this.storage.createInvoiceFromBooking(bookingId);
    if (!invoice) {
      const booking = this.storage.findBooking(bookingId);
      if (!booking) {
        throw new NotFoundException(`Booking ${bookingId} not found`);
      }
      throw new BadRequestException(
        'Invoice can only be generated from a confirmed booking',
      );
    }
    return invoice;
  }

  update(id: string, dto: UpdateInvoiceDto): Invoice {
    const invoice = this.storage.updateInvoice(id, {
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.lineItems !== undefined && {
        lineItems: dto.lineItems.map((item) => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      }),
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }

  markPaid(id: string): Invoice {
    const invoice = this.storage.markInvoicePaid(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }
}
