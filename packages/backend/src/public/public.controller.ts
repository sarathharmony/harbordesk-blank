import { Body, Controller, Get, Post } from '@nestjs/common';
import { PublicService } from './public.service';
import { PublicBookDto } from './dto/public-book.dto';
import { Booking } from '../storage/storage.types';

@Controller('api/public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('rooms')
  getRooms(): string[] {
    return this.publicService.getRooms();
  }

  @Get('availability')
  getAvailability(): Booking[] {
    return this.publicService.getAvailability();
  }

  @Post('book')
  book(@Body() dto: PublicBookDto): Booking {
    return this.publicService.createBooking(dto);
  }
}
