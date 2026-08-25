import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Booking } from '../storage/storage.types';
import { PublicBookDto } from './dto/public-book.dto';

const DEFAULT_HOURLY_RATE = 85;

@Injectable()
export class PublicService {
  constructor(private readonly storage: StorageService) {}

  getRooms(): string[] {
    return this.storage.getRooms();
  }

  getAvailability(): Booking[] {
    return this.storage
      .findAllBookings()
      .filter((b) => b.status !== 'cancelled');
  }

  createBooking(dto: PublicBookDto): Booking {
    if (new Date(dto.end) <= new Date(dto.start)) {
      throw new BadRequestException('End time must be after start time');
    }

    let client = this.storage.findClientByEmail(dto.email);
    if (!client) {
      client = this.storage.createClient({
        name: dto.name.trim(),
        email: dto.email.trim(),
        phone: '',
        notes: 'Created via public booking page',
      });
    }

    const rooms = this.storage.getRooms();
    const room = dto.room?.trim() || rooms[0];

    return this.storage.createBooking({
      clientId: client.id,
      start: dto.start,
      end: dto.end,
      room,
      status: 'held',
      hourlyRate: DEFAULT_HOURLY_RATE,
    });
  }
}
