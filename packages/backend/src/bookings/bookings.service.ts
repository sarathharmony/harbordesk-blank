import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Booking } from '../storage/storage.types';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

const DEFAULT_HOURLY_RATE = 85;

@Injectable()
export class BookingsService {
  constructor(private readonly storage: StorageService) {}

  findAll(): Booking[] {
    return this.storage.findAllBookings();
  }

  findOne(id: string): Booking {
    const booking = this.storage.findBooking(id);
    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }
    return booking;
  }

  create(dto: CreateBookingDto): Booking {
    if (!this.storage.findClient(dto.clientId)) {
      throw new NotFoundException(`Client ${dto.clientId} not found`);
    }
    if (new Date(dto.end) <= new Date(dto.start)) {
      throw new BadRequestException('End time must be after start time');
    }
    return this.storage.createBooking({
      clientId: dto.clientId,
      start: dto.start,
      end: dto.end,
      room: dto.room.trim(),
      status: dto.status ?? 'held',
      hourlyRate: dto.hourlyRate ?? DEFAULT_HOURLY_RATE,
    });
  }

  update(id: string, dto: UpdateBookingDto): Booking {
    const existing = this.findOne(id);
    if (dto.clientId && !this.storage.findClient(dto.clientId)) {
      throw new NotFoundException(`Client ${dto.clientId} not found`);
    }
    const start = dto.start ?? existing.start;
    const end = dto.end ?? existing.end;
    if (new Date(end) <= new Date(start)) {
      throw new BadRequestException('End time must be after start time');
    }
    const booking = this.storage.updateBooking(id, {
      ...(dto.clientId !== undefined && { clientId: dto.clientId }),
      ...(dto.start !== undefined && { start: dto.start }),
      ...(dto.end !== undefined && { end: dto.end }),
      ...(dto.room !== undefined && { room: dto.room.trim() }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.hourlyRate !== undefined && { hourlyRate: dto.hourlyRate }),
    });
    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }
    return booking;
  }
}
